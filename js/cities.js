// [name, latitude, longitude] grouped by province / region
const CITY_DATA = {
  "Punjab": [
    ["Lahore", 31.5497, 74.3436], ["Faisalabad", 31.4504, 73.135], ["Rawalpindi", 33.5651, 73.0169],
    ["Multan", 30.1575, 71.5249], ["Gujranwala", 32.1877, 74.1945], ["Sialkot", 32.4945, 74.5229],
    ["Bahawalpur", 29.3956, 71.6836], ["Sargodha", 32.0836, 72.6711], ["Sahiwal", 30.6682, 73.1114],
    ["Jhang", 31.2681, 72.3181], ["Gujrat", 32.5731, 74.0789], ["Sheikhupura", 31.7167, 73.985],
    ["Rahim Yar Khan", 28.4202, 70.2952], ["Bhakkar", 31.6258, 71.0654], ["Dera Ghazi Khan", 30.0561, 70.6403],
    ["Okara", 30.8138, 73.4534], ["Kasur", 31.1187, 74.4467], ["Mianwali", 32.5839, 71.537],
    ["Jhelum", 32.9425, 73.7257], ["Attock", 33.766, 72.3609], ["Chiniot", 31.72, 72.9789],
    ["Khanewal", 30.3017, 71.9321], ["Muzaffargarh", 30.0703, 71.1933], ["Layyah", 30.9693, 70.9428],
    ["Vehari", 30.0453, 72.3489], ["Murree", 33.907, 73.3943]
  ],
  "Sindh": [
    ["Karachi", 24.8607, 67.0011], ["Hyderabad", 25.396, 68.3578], ["Sukkur", 27.7052, 68.8574],
    ["Larkana", 27.557, 68.2028], ["Nawabshah", 26.2442, 68.41], ["Mirpur Khas", 25.5276, 69.0111],
    ["Jacobabad", 28.2769, 68.4514], ["Thatta", 24.7461, 67.9236], ["Khairpur", 27.5295, 68.7592]
  ],
  "Khyber Pakhtunkhwa": [
    ["Peshawar", 34.0151, 71.5249], ["Mardan", 34.1989, 72.0231], ["Abbottabad", 34.1688, 73.2215],
    ["Mingora (Swat)", 34.7717, 72.36], ["Kohat", 33.5869, 71.4414], ["Bannu", 32.9889, 70.6056],
    ["Dera Ismail Khan", 31.8313, 70.9017], ["Mansehra", 34.3333, 73.2], ["Nowshera", 34.0153, 71.9747],
    ["Charsadda", 34.1453, 71.7308], ["Swabi", 34.12, 72.47], ["Haripur", 33.9946, 72.9333], ["Chitral", 35.8518, 71.7864]
  ],
  "Balochistan": [
    ["Quetta", 30.1798, 66.975], ["Gwadar", 25.1216, 62.3254], ["Turbat", 26.0012, 63.0544],
    ["Khuzdar", 27.8, 66.6167], ["Chaman", 30.921, 66.4597], ["Zhob", 31.341, 69.449],
    ["Sibi", 29.543, 67.8773], ["Hub", 25.0944, 66.8963]
  ],
  "Islamabad Capital Territory": [["Islamabad", 33.6844, 73.0479]],
  "Azad Kashmir": [["Muzaffarabad", 34.37, 73.4711], ["Mirpur", 33.1478, 73.7519], ["Kotli", 33.5183, 73.9022]],
  "Gilgit-Baltistan": [["Gilgit", 35.9208, 74.308], ["Skardu", 35.2971, 75.6333], ["Hunza (Karimabad)", 36.3167, 74.65]]
};
