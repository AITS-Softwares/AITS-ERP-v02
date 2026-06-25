const STATE_CODE_MAP = {
  "01": "Jammu and Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "25": "Daman and Diu",
  "26": "Dadra and Nagar Haveli and Daman and Diu",
  "27": "Maharashtra",
  "28": "Andhra Pradesh",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman and Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh (New)",
  "38": "Ladakh",
  "97": "Other Territory",
  "99": "Centre Jurisdiction",
};

const STATE_NAME_TO_CODE = Object.fromEntries(
  Object.entries(STATE_CODE_MAP).map(([code, name]) => [name.toLowerCase(), code])
);

export function getStateNameFromCode(code = "") {
  return STATE_CODE_MAP[String(code).padStart(2, "0")] || "";
}

export function getStateCodeFromName(name = "") {
  return STATE_NAME_TO_CODE[String(name).trim().toLowerCase()] || "";
}

export function getStateCodeFromGSTIN(gstin = "") {
  const value = String(gstin).trim().toUpperCase();
  return /^[0-9]{2}[0-9A-Z]{13}$/.test(value) ? value.slice(0, 2) : "";
}
