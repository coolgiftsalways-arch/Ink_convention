import { useState } from "react";
import {
  Upload as UploadIcon,
  Image,
  Video,
  Mail,
  Phone,
  MapPin,
  Compass,
  CheckCircle2,
  User,
  AtSign,
  Home,
} from "lucide-react";

// Comprehensive database of Indian States & UTs and popular cities
const locationData = [
  {
    state: "Andhra Pradesh",
    cities: [
      "Visakhapatnam",
      "Vijayawada",
      "Guntur",
      "Nellore",
      "Kurnool",
      "Tirupati",
    ],
  },
  {
    state: "Arunachal Pradesh",
    cities: ["Itanagar", "Tawang", "Pasighat", "Ziro"],
  },
  {
    state: "Assam",
    cities: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur"],
  },
  {
    state: "Bihar",
    cities: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga"],
  },
  {
    state: "Chhattisgarh",
    cities: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
  },
  {
    state: "Goa",
    cities: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  },
  {
    state: "Gujarat",
    cities: [
      "Ahmedabad",
      "Surat",
      "Vadodara",
      "Rajkot",
      "Gandhinagar",
      "Bhavnagar",
    ],
  },
  {
    state: "Haryana",
    cities: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Rohtak"],
  },
  {
    state: "Himachal Pradesh",
    cities: ["Shimla", "Manali", "Dharamshala", "Solan", "Kullu"],
  },
  {
    state: "Jharkhand",
    cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"],
  },
  {
    state: "Karnataka",
    cities: [
      "Bengaluru",
      "Mysuru",
      "Mangaluru",
      "Hubballi",
      "Belagavi",
      "Udupi",
    ],
  },
  {
    state: "Kerala",
    cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
  },
  {
    state: "Madhya Pradesh",
    cities: ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar"],
  },
  {
    state: "Maharashtra",
    cities: [
      "Mumbai",
      "Pune",
      "Nagpur",
      "Nashik",
      "Thane",
      "Aurangabad",
      "Solapur",
      "Kolhapur",
      "Amravati",
    ],
  },
  { state: "Manipur", cities: ["Imphal", "Thoubal", "Bishnupur"] },
  { state: "Meghalaya", cities: ["Shillong", "Tura", "Jowai"] },
  { state: "Mizoram", cities: ["Aizawl", "Lunglei", "Champhai"] },
  { state: "Nagaland", cities: ["Kohima", "Dimapur", "Mokokchung"] },
  {
    state: "Odisha",
    cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur"],
  },
  {
    state: "Punjab",
    cities: [
      "Chandigarh",
      "Amritsar",
      "Ludhiana",
      "Jalandhar",
      "Patiala",
      "Bathinda",
    ],
  },
  {
    state: "Rajasthan",
    cities: [
      "Jaipur",
      "Jodhpur",
      "Udaipur",
      "Kota",
      "Ajmer",
      "Bikaner",
      "Bhilwara",
    ],
  },
  { state: "Sikkim", cities: ["Gangtok", "Namchi", "Gyalshing"] },
  {
    state: "Tamil Nadu",
    cities: [
      "Chennai",
      "Coimbatore",
      "Madurai",
      "Tiruchirappalli",
      "Salem",
      "Tirunelveli",
    ],
  },
  {
    state: "Telangana",
    cities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  },
  { state: "Tripura", cities: ["Agartala", "Udaipur", "Dharmanagar"] },
  {
    state: "Uttar Pradesh",
    cities: [
      "Lucknow",
      "Kanpur",
      "Varanasi",
      "Agra",
      "Noida",
      "Ghaziabad",
      "Prayagraj",
      "Meerut",
      "Bareilly",
    ],
  },
  {
    state: "Uttarakhand",
    cities: ["Dehradun", "Haridwar", "Rishikesh", "Haldwani", "Nainital"],
  },
  {
    state: "West Bengal",
    cities: [
      "Kolkata",
      "Howrah",
      "Durgapur",
      "Siliguri",
      "Asansol",
      "Kharagpur",
    ],
  },
  {
    state: "Delhi",
    cities: [
      "New Delhi",
      "North Delhi",
      "South Delhi",
      "East Delhi",
      "West Delhi",
    ],
  },
  {
    state: "Jammu and Kashmir",
    cities: ["Srinagar", "Jammu", "Anantnag", "Baramulla"],
  },
  { state: "Ladakh", cities: ["Leh", "Kargil"] },
];

function Upload() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    delayNumber: "",
    gmail: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
  });

  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const [citySuggestions, setCitySuggestions] = useState([]);
  const [stateSuggestions, setStateSuggestions] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

    if (name === "city") {
      const query = value.trim().toLowerCase();
      if (query.length > 0) {
        const matches = [];
        locationData.forEach((item) => {
          item.cities.forEach((c) => {
            if (c.toLowerCase().includes(query)) {
              matches.push({ city: c, state: item.state });
            }
          });
        });
        setCitySuggestions(matches);

        const exactMatch = locationData.find((item) =>
          item.cities.some((c) => c.toLowerCase() === query),
        );
        if (exactMatch) {
          updatedData.state = exactMatch.state;
        }
      } else {
        setCitySuggestions([]);
      }
    }

    if (name === "state") {
      const query = value.trim().toLowerCase();
      if (query.length > 0) {
        const matches = locationData
          .filter((item) => item.state.toLowerCase().includes(query))
          .map((item) => item.state);
        setStateSuggestions(matches);
      } else {
        setStateSuggestions([]);
      }
    }

    setFormData(updatedData);
  };

  const handleSelectCity = (cityObj) => {
    setFormData({
      ...formData,
      city: cityObj.city,
      state: cityObj.state,
    });
    setCitySuggestions([]);
  };

  const handleSelectState = (stateName) => {
    setFormData({
      ...formData,
      state: stateName,
    });
    setStateSuggestions([]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert("You can upload a maximum of 5 images.");
      return;
    }
    setImages(files);
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      alert("You can upload a maximum of 3 videos.");
      return;
    }
    setVideos(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0 || images.length > 5) {
      alert("Please upload between 1 and 5 images.");
      return;
    }

    if (videos.length === 0 || videos.length > 3) {
      alert("Please upload between 1 and 3 videos.");
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append("firstName", formData.firstName);
    dataToSend.append("lastName", formData.lastName);
    dataToSend.append("username", formData.username);
    dataToSend.append("delayNumber", formData.delayNumber);
    dataToSend.append("gmail", formData.gmail);
    dataToSend.append("address1", formData.address1);
    dataToSend.append("address2", formData.address2);
    dataToSend.append("city", formData.city);
    dataToSend.append("state", formData.state);

    images.forEach((image) => {
      dataToSend.append("images", image);
    });

    videos.forEach((video) => {
      dataToSend.append("videos", video);
    });

    try {
      const response = await fetch("https://api.inkconvention.com/api/signup", {
        method: "POST",
        body: dataToSend,
      });

      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
      } else {
        alert(data.message || "Failed to submit data");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Network error: Could not connect to server.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#08080a] text-white select-none pt-24 pb-24 px-4 sm:px-6 lg:px-12 overflow-x-hidden box-border">
      <div className="max-w-4xl mx-auto space-y-8 w-full">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#a855f7] text-xs font-mono uppercase tracking-widest">
            <UploadIcon size={14} /> EXPO 2026 ARTIST ENTER PORTAL
          </div>
          <h1 className="text-3xl sm:text-6xl font-black tracking-tighter text-white break-words">
            SUBMIT YOUR COMPETITION ENTRY
          </h1>
          <p className="text-gray-400 text-sm sm:text-base font-light leading-relaxed">
            Complete your profile and upload your work to enter the EXPO 2026
            competition. All entries must be received before 10th September.
          </p>
        </div>

        {submitted ? (
          <div className="bg-[#0b0b0f] border border-purple-500/40 rounded-3xl p-6 sm:p-10 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-[#a855f7] mx-auto animate-bounce">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white">
              Transmission Successful
            </h3>
            <p className="text-gray-400 text-sm font-light">
              Your data nodes and media files have been securely logged into the
              network registry for @{formData.username || "username"}.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  firstName: "",
                  lastName: "",
                  username: "",
                  delayNumber: "",
                  gmail: "",
                  address1: "",
                  address2: "",
                  city: "",
                  state: "",
                });
                setImages([]);
                setVideos([]);
                setCitySuggestions([]);
                setStateSuggestions([]);
              }}
              className="mt-4 px-6 py-2.5 rounded-xl bg-[#a855f7] text-white font-mono text-xs uppercase tracking-widest hover:opacity-95 transition cursor-pointer"
            >
              Upload Another Node
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-[#0b0b0f] border border-white/10 rounded-3xl p-5 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-[#a855f7]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-30">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} className="text-[#a855f7]" /> FIRST NAME
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a855f7] transition"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} className="text-[#a855f7]" /> LAST NAME
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a855f7] transition"
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <AtSign size={14} className="text-[#a855f7]" /> @ INSTAGRAM /
                  WEBSITE HANDLE
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-gray-500 text-sm font-mono">
                    @
                  </span>
                  <input
                    type="text"
                    name="username"
                    required
                    placeholder="yourhandle"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#a855f7] transition font-mono"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Phone size={14} className="text-[#a855f7]" /> PHONE /
                  WHATSAPP NUMBER
                </label>
                <input
                  type="text"
                  name="delayNumber"
                  required
                  placeholder="Enter contact number"
                  value={formData.delayNumber}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a855f7] transition"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={14} className="text-[#a855f7]" /> EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  name="gmail"
                  required
                  placeholder="Enter active email"
                  value={formData.gmail}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a855f7] transition"
                />
              </div>

              {/* Address Line 1 */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Home size={14} className="text-[#a855f7]" /> ADDRESS LINE 1
                </label>
                <input
                  type="text"
                  name="address1"
                  required
                  placeholder="Street address, building, etc."
                  value={formData.address1}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a855f7] transition"
                />
              </div>

              {/* Address Line 2 */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Home size={14} className="text-[#a855f7]" /> ADDRESS LINE 2
                  (OPTIONAL)
                </label>
                <input
                  type="text"
                  name="address2"
                  placeholder="Apartment, suite, unit, etc."
                  value={formData.address2}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a855f7] transition"
                />
              </div>

              {/* City with Dropdown */}
              <div className="space-y-2 relative">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={14} className="text-[#a855f7]" /> CITY
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  autoComplete="off"
                  placeholder="Type city (e.g. M for Mumbai...)"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a855f7] transition"
                />
                {citySuggestions.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#121218] border border-[#a855f7] rounded-xl max-h-56 overflow-y-auto shadow-[0_10px_25px_rgba(0,0,0,0.8)] py-2">
                    {citySuggestions.map((item, index) => (
                      <li
                        key={index}
                        onClick={() => handleSelectCity(item)}
                        className="px-4 py-3 text-sm text-gray-200 hover:bg-[#a855f7] hover:text-white cursor-pointer flex justify-between items-center transition-colors"
                      >
                        <span className="font-semibold">{item.city}</span>
                        <span className="text-xs text-purple-300 font-mono">
                          {item.state}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* State with Dropdown */}
              <div className="space-y-2 relative">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Compass size={14} className="text-[#a855f7]" /> STATE
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  autoComplete="off"
                  placeholder="Type state (e.g. Maharashtra...)"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a855f7] transition"
                />
                {stateSuggestions.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#121218] border border-[#a855f7] rounded-xl max-h-56 overflow-y-auto shadow-[0_10px_25px_rgba(0,0,0,0.8)] py-2">
                    {stateSuggestions.map((st, index) => (
                      <li
                        key={index}
                        onClick={() => handleSelectState(st)}
                        className="px-4 py-3 text-sm font-semibold text-gray-200 hover:bg-[#a855f7] hover:text-white cursor-pointer transition-colors"
                      >
                        {st}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* File Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Image size={14} className="text-[#a855f7]" /> UPLOAD IMAGES
                  (1 TO 5 IMAGES MAX)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  required
                  onChange={handleImageChange}
                  className="w-full text-xs text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-mono file:bg-purple-500/10 file:text-[#a855f7] hover:file:bg-purple-500/20 file:cursor-pointer cursor-pointer bg-black/50 border border-white/10 rounded-xl p-2"
                />
                <p className="text-[10px] font-mono text-gray-500">
                  JPG, PNG, WEBP | ({images.length} / 5 images selected)
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Video size={14} className="text-[#a855f7]" /> UPLOAD VIDEOS
                  (1 TO 3 VIDEOS MAX)
                </label>
                <input
                  type="file"
                  accept="video/mp4,video/quicktime"
                  multiple
                  required
                  onChange={handleVideoChange}
                  className="w-full text-xs text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-mono file:bg-purple-500/10 file:text-[#a855f7] hover:file:bg-purple-500/20 file:cursor-pointer cursor-pointer bg-black/50 border border-white/10 rounded-xl p-2"
                />
                <p className="text-[10px] font-mono text-gray-500">
                  MP4, MOV | ({videos.length} / 3 videos selected)
                </p>
              </div>
            </div>

            <div className="pt-4 relative z-10">
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-[#a855f7] text-white font-mono text-xs uppercase tracking-[0.2em] font-bold hover:opacity-95 transition shadow-lg shadow-purple-900/40 cursor-pointer"
              >
                SUBMIT ENTRY FOR EXPO 2026
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Upload;
