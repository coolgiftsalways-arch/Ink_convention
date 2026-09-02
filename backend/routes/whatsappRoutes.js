const express = require("express");

const CampaignContact = require(
  "../models/CampaignContact",
);

const WhatsAppMessage = require(
  "../models/WhatsAppMessage",
);

const {
  normalizePhone,

  sendWhatsAppTemplate,

  sendMarketingWhatsApp,
} = require(
  "../services/whatsappService",
);

const router = express.Router();

/* =========================================================
   ADMIN PROTECTION

   Do NOT make campaign API public.
========================================================= */

function requireWhatsAppAdmin(
  req,
  res,
  next,
) {
  const key =
    req.headers["x-admin-key"];

  if (
    !process.env
      .WHATSAPP_ADMIN_KEY ||
    key !==
      process.env
        .WHATSAPP_ADMIN_KEY
  ) {
    return res.status(401).json({
      success: false,

      message:
        "Unauthorized.",
    });
  }

  next();
}

/* =========================================================
   CHECK WHATSAPP SERVICE

   GET /api/whatsapp/status
========================================================= */

router.get(
  "/status",

  (req, res) => {
    return res.json({
      success: true,

      configured: Boolean(
        process.env.MSG91_AUTH_KEY &&
          process.env
            .MSG91_WHATSAPP_NUMBER,
      ),

      number:
        process.env
          .MSG91_WHATSAPP_NUMBER
          ? "Configured"
          : "Not configured",

      bookingTemplate:
        process.env
          .MSG91_BOOKING_TEMPLATE ||
        "Not configured",

      marketingTemplate:
        process.env
          .MSG91_MARKETING_TEMPLATE ||
        "Not configured",
    });
  },
);

/* =========================================================
   TEST WHATSAPP

   POST /api/whatsapp/test

   Headers:
   x-admin-key: YOUR_KEY

   Body:

   {
     "phone": "919876543210",
     "name": "Ahmed"
   }
========================================================= */

router.post(
  "/test",

  requireWhatsAppAdmin,

  async (req, res) => {
    try {
      const phone =
        normalizePhone(
          req.body.phone,
        );

      const name =
        String(
          req.body.name ||
            "Artist",
        ).trim();

      if (!phone) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Phone number is required.",
          });
      }

      const log =
        await WhatsAppMessage.create({
          phone,

          recipientName: name,

          type: "other",

          templateName:
            process.env
              .MSG91_BOOKING_TEMPLATE,

          status: "queued",
        });

      /*
        Use MongoDB document ID as CRQID.
      */

      log.crqid =
        String(log._id);

      await log.save();

      try {
        const result =
          await sendWhatsAppTemplate(
            {
              phone,

              templateName:
                process.env
                  .MSG91_BOOKING_TEMPLATE,

              namespace:
                process.env
                  .MSG91_WHATSAPP_NAMESPACE,

              language:
                process.env
                  .MSG91_BOOKING_LANGUAGE ||
                "en",

              variables: [
                name,

                process.env
                  .FRONTEND_URL,
              ],

              crqid:
                String(log._id),
            },
          );

        log.status =
          "submitted";

        log.submittedAt =
          new Date();

        log.apiResponse =
          result.response;

        await log.save();

        return res.json({
          success: true,

          message:
            "WhatsApp test message submitted.",

          messageId:
            log._id,

          result,
        });
      } catch (error) {
        log.status = "failed";

        log.failedAt =
          new Date();

        log.failureReason =
          error.message;

        await log.save();

        throw error;
      }
    } catch (error) {
      console.error(
        "❌ WhatsApp test error:",
        error,
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.message,
        });
    }
  },
);

/* =========================================================
   ADD CAMPAIGN CONTACT

   POST /api/whatsapp/contacts
========================================================= */

router.post(
  "/contacts",

  requireWhatsAppAdmin,

  async (req, res) => {
    try {
      const phone =
        normalizePhone(
          req.body.phone,
        );

      if (!phone) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Phone number required.",
          });
      }

      const contact =
        await CampaignContact.findOneAndUpdate(
          {
            phone,
          },

          {
            $set: {
              name:
                req.body.name ||
                "",

              email:
                req.body.email ||
                "",

              city:
                req.body.city ||
                "",

              whatsappOptIn:
                req.body
                  .whatsappOptIn ===
                true,

              whatsappOptInAt:
                req.body
                  .whatsappOptIn ===
                true
                  ? new Date()
                  : null,

              whatsappOptInSource:
                req.body
                  .whatsappOptInSource ||
                "website",
            },
          },

          {
            new: true,

            upsert: true,

            runValidators: true,
          },
        );

      return res.json({
        success: true,

        contact,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,

          message:
            error.message,
        });
    }
  },
);

/* =========================================================
   SEND NEXT MARKETING BATCH

   POST /api/whatsapp/campaign/send-batch

   Header:
   x-admin-key: YOUR_KEY

   Body:
   {
     "limit": 100,
     "campaignName": "website_launch"
   }

   IMPORTANT:
   Only whatsappOptIn:true users are selected.
========================================================= */

router.post(
  "/campaign/send-batch",

  requireWhatsAppAdmin,

  async (req, res) => {
    try {
      /*
        Keep each HTTP request small.

        10,000 contacts should be processed
        in batches instead of keeping a
        request running forever.
      */

      const limit = Math.min(
        Math.max(
          Number(
            req.body.limit,
          ) || 100,

          1,
        ),

        200,
      );

      const campaignName =
        String(
          req.body
            .campaignName ||
            "ink_convention_marketing",
        ).trim();

      const contacts =
        await CampaignContact.find({
          whatsappOptIn: true,

          marketingStatus: {
            $in: [
              "never_sent",
              "failed",
            ],
          },
        })
          .limit(limit)
          .lean();

      if (
        contacts.length === 0
      ) {
        return res.json({
          success: true,

          finished: true,

          message:
            "No eligible opted-in contacts remaining.",

          sent: 0,
        });
      }

      let submitted = 0;
      let failed = 0;

      const results = [];

      for (
        const contact of contacts
      ) {
        const log =
          await WhatsAppMessage.create(
            {
              phone:
                contact.phone,

              recipientName:
                contact.name,

              type: "marketing",

              templateName:
                process.env
                  .MSG91_MARKETING_TEMPLATE,

              campaignName,

              status: "queued",
            },
          );

        log.crqid =
          String(log._id);

        await log.save();

        try {
          const result =
            await sendMarketingWhatsApp(
              {
                phone:
                  contact.phone,

                customerName:
                  contact.name ||
                  "there",

                crqid:
                  String(
                    log._id,
                  ),
              },
            );

          log.status =
            "submitted";

          log.submittedAt =
            new Date();

          log.apiResponse =
            result.response;

          await log.save();

          await CampaignContact.updateOne(
            {
              _id:
                contact._id,
            },

            {
              $set: {
                marketingStatus:
                  "sent",

                lastMarketingSentAt:
                  new Date(),
              },
            },
          );

          submitted++;

          results.push({
            phone:
              contact.phone,

            success: true,
          });
        } catch (error) {
          failed++;

          log.status =
            "failed";

          log.failedAt =
            new Date();

          log.failureReason =
            error.message;

          await log.save();

          await CampaignContact.updateOne(
            {
              _id:
                contact._id,
            },

            {
              $set: {
                marketingStatus:
                  "failed",
              },
            },
          );

          results.push({
            phone:
              contact.phone,

            success: false,

            error:
              error.message,
          });
        }
      }

      const remaining =
        await CampaignContact.countDocuments(
          {
            whatsappOptIn: true,

            marketingStatus: {
              $in: [
                "never_sent",
                "failed",
              ],
            },
          },
        );

      return res.json({
        success: true,

        campaignName,

        processed:
          contacts.length,

        submitted,

        failed,

        remaining,

        finished:
          remaining === 0,

        results,
      });
    } catch (error) {
      console.error(
        "❌ Campaign error:",
        error,
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.message,
        });
    }
  },
);

/* =========================================================
   GET WHATSAPP LOGS

   GET /api/whatsapp/messages
========================================================= */

router.get(
  "/messages",

  requireWhatsAppAdmin,

  async (req, res) => {
    try {
      const messages =
        await WhatsAppMessage.find()
          .sort({
            createdAt: -1,
          })
          .limit(200)
          .lean();

      return res.json({
        success: true,

        count:
          messages.length,

        messages,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,

          message:
            error.message,
        });
    }
  },
);

module.exports = router;