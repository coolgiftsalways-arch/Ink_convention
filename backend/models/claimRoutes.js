const express = require("express");

const TattooStudio = require("../models/TattooStudio");
const { verifyMsg91AccessToken } = require("../services/msg91OtpService");

const {
  normalizePlan,
  ensureMembershipCurrent,
  applyBasicPlan,
} = require("../services/membershipService");

const TATTOO_CATEGORIES = require("../constants/tattooCategories");

const {
  CLAIM_SESSION_MS,
  signClaimToken,
  requireClaimSession,
  setClaimSessionCookie,
  clearClaimSessionCookies,
} = require("../middleware/claimSession");

const router = express.Router();
