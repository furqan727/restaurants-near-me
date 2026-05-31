export interface IndianCity {
  name: string;
  latitude: number;
  longitude: number;
}

export interface IndianState {
  name: string;
  type: "State" | "Union Territory";
  cities: IndianCity[];
}

export const INDIA_STATES_AND_CITIES: IndianState[] = [
  {
    name: "Andhra Pradesh",
    type: "State",
    cities: [
      { name: "Visakhapatnam", latitude: 17.6868, longitude: 83.2185 },
      { name: "Vijayawada", latitude: 16.5062, longitude: 80.648 },
      { name: "Guntur", latitude: 16.3067, longitude: 80.4365 },
      { name: "Tirupati", latitude: 13.6288, longitude: 79.4192 },
      { name: "Nellore", latitude: 14.4426, longitude: 79.9865 },
      { name: "Kurnool", latitude: 15.8281, longitude: 78.0373 },
      { name: "Kakinada", latitude: 16.9891, longitude: 82.2475 },
      { name: "Rajamahendravaram", latitude: 17.0005, longitude: 81.7835 },
      { name: "Kadapa", latitude: 14.4673, longitude: 78.8242 },
      { name: "Anantapur", latitude: 14.6819, longitude: 77.6006 },
      { name: "Eluru", latitude: 16.7117, longitude: 81.1031 },
      { name: "Vizianagaram", latitude: 18.1124, longitude: 83.3984 },
      { name: "Ongole", latitude: 15.5057, longitude: 80.0499 }
    ]
  },
  {
    name: "Arunachal Pradesh",
    type: "State",
    cities: [
      { name: "Itanagar", latitude: 27.0844, longitude: 93.6053 },
      { name: "Tawang", latitude: 27.5857, longitude: 91.8594 },
      { name: "Pasighat", latitude: 28.0620, longitude: 95.3265 },
      { name: "Ziro", latitude: 27.5922, longitude: 93.8383 },
      { name: "Tezu", latitude: 27.9135, longitude: 96.1623 }
    ]
  },
  {
    name: "Assam",
    type: "State",
    cities: [
      { name: "Guwahati", latitude: 26.1158, longitude: 91.7086 },
      { name: "Dibrugarh", latitude: 27.4728, longitude: 94.9120 },
      { name: "Silchar", latitude: 24.8174, longitude: 92.7789 },
      { name: "Jorhat", latitude: 26.7579, longitude: 94.2038 },
      { name: "Nagaon", latitude: 26.3478, longitude: 92.6841 },
      { name: "Tezpur", latitude: 26.6338, longitude: 92.7926 },
      { name: "Tinsukia", latitude: 27.4922, longitude: 95.3624 }
    ]
  },
  {
    name: "Bihar",
    type: "State",
    cities: [
      { name: "Patna", latitude: 25.5941, longitude: 85.1376 },
      { name: "Gaya", latitude: 24.7955, longitude: 85.0075 },
      { name: "Muzaffarpur", latitude: 26.1209, longitude: 85.3647 },
      { name: "Bhagalpur", latitude: 25.2425, longitude: 86.9842 },
      { name: "Darbhanga", latitude: 26.1542, longitude: 85.8918 },
      { name: "Purnia", latitude: 25.7771, longitude: 87.4753 },
      { name: "Bihar Sharif", latitude: 25.1982, longitude: 85.5149 },
      { name: "Arrah", latitude: 25.5583, longitude: 84.6629 },
      { name: "Begusarai", latitude: 25.4184, longitude: 86.1274 },
      { name: "Munger", latitude: 25.3748, longitude: 86.4735 }
    ]
  },
  {
    name: "Chhattisgarh",
    type: "State",
    cities: [
      { name: "Raipur", latitude: 21.2514, longitude: 81.6296 },
      { name: "Bilaspur", latitude: 22.0797, longitude: 82.1391 },
      { name: "Bhilai", latitude: 21.1938, longitude: 81.3509 },
      { name: "Durg", latitude: 21.1904, longitude: 81.2849 },
      { name: "Korba", latitude: 22.3597, longitude: 82.7501 },
      { name: "Jagdalpur", latitude: 19.0700, longitude: 82.0300 },
      { name: "Ambikapur", latitude: 23.1200, longitude: 83.2000 }
    ]
  },
  {
    name: "Goa",
    type: "State",
    cities: [
      { name: "Panaji", latitude: 15.4909, longitude: 73.8278 },
      { name: "Margao", latitude: 15.2736, longitude: 73.9582 },
      { name: "Vasco da Gama", latitude: 15.3959, longitude: 73.8143 },
      { name: "Mapusa", latitude: 15.5929, longitude: 73.8112 },
      { name: "Ponda", latitude: 15.4018, longitude: 74.0124 }
    ]
  },
  {
    name: "Gujarat",
    type: "State",
    cities: [
      { name: "Ahmedabad", latitude: 23.0225, longitude: 72.5714 },
      { name: "Surat", latitude: 21.1702, longitude: 72.8311 },
      { name: "Vadodara", latitude: 22.3072, longitude: 73.1812 },
      { name: "Rajkot", latitude: 22.3039, longitude: 70.8022 },
      { name: "Gandhinagar", latitude: 23.2156, longitude: 72.6369 },
      { name: "Bhavnagar", latitude: 21.7645, longitude: 72.1519 },
      { name: "Jamnagar", latitude: 22.4707, longitude: 70.0577 },
      { name: "Junagadh", latitude: 21.5222, longitude: 70.4579 },
      { name: "Anand", latitude: 22.5645, longitude: 72.9289 },
      { name: "Navsari", latitude: 20.9467, longitude: 72.9520 },
      { name: "Morbi", latitude: 22.8120, longitude: 70.8354 },
      { name: "Bharuch", latitude: 21.7051, longitude: 72.9959 },
      { name: "Mehsana", latitude: 23.5880, longitude: 72.3693 },
      { name: "Vapi", latitude: 20.3724, longitude: 72.9113 },
      { name: "Bhuj", latitude: 23.2420, longitude: 69.6669 },
      { name: "Porbandar", latitude: 21.6417, longitude: 69.6293 }
    ]
  },
  {
    name: "Haryana",
    type: "State",
    cities: [
      { name: "Gurugram", latitude: 28.4595, longitude: 77.0266 },
      { name: "Faridabad", latitude: 28.4089, longitude: 77.3178 },
      { name: "Ambala", latitude: 30.3782, longitude: 76.7767 },
      { name: "Panipat", latitude: 29.3909, longitude: 76.9635 },
      { name: "Karnal", latitude: 29.6857, longitude: 76.9905 },
      { name: "Sonipat", latitude: 28.9931, longitude: 77.0151 },
      { name: "Rohtak", latitude: 28.8955, longitude: 76.6066 },
      { name: "Hisar", latitude: 29.1492, longitude: 75.7217 },
      { name: "Panchkula", latitude: 30.6942, longitude: 76.8606 }
    ]
  },
  {
    name: "Himachal Pradesh",
    type: "State",
    cities: [
      { name: "Shimla", latitude: 31.1048, longitude: 77.1734 },
      { name: "Dharamshala", latitude: 32.2190, longitude: 76.3234 },
      { name: "Manali", latitude: 32.2396, longitude: 77.1887 },
      { name: "Solan", latitude: 30.9045, longitude: 77.0967 },
      { name: "Mandi", latitude: 31.5841, longitude: 76.9157 },
      { name: "Kullu", latitude: 31.9578, longitude: 77.1095 },
      { name: "Chamba", latitude: 32.5534, longitude: 76.1258 }
    ]
  },
  {
    name: "Jharkhand",
    type: "State",
    cities: [
      { name: "Ranchi", latitude: 23.3441, longitude: 85.3096 },
      { name: "Jamshedpur", latitude: 22.8046, longitude: 86.2029 },
      { name: "Dhanbad", latitude: 23.7957, longitude: 86.4304 },
      { name: "Bokaro", latitude: 23.6693, longitude: 86.1511 },
      { name: "Deoghar", latitude: 24.4820, longitude: 86.7001 },
      { name: "Hazaribagh", latitude: 23.9979, longitude: 85.3690 },
      { name: "Giridih", latitude: 24.1900, longitude: 86.3000 }
    ]
  },
  {
    name: "Karnataka",
    type: "State",
    cities: [
      { name: "Bengaluru (Central)", latitude: 12.9716, longitude: 77.5946 },
      { name: "Indiranagar", latitude: 12.9718, longitude: 77.6411 },
      { name: "Koramangala", latitude: 12.9352, longitude: 77.6245 },
      { name: "Jayanagar", latitude: 12.9308, longitude: 77.5833 },
      { name: "Whitefield", latitude: 12.9698, longitude: 77.7500 },
      { name: "HSR Layout", latitude: 12.9105, longitude: 77.6450 },
      { name: "MG Road", latitude: 12.9738, longitude: 77.6119 },
      { name: "Malleshwaram", latitude: 13.0031, longitude: 77.5702 },
      { name: "Basavanagudi", latitude: 12.9417, longitude: 77.5755 },
      { name: "Sadashivanagar", latitude: 13.0068, longitude: 77.5813 },
      { name: "Marathahalli", latitude: 12.9569, longitude: 77.6967 },
      { name: "Electronic City", latitude: 12.8452, longitude: 77.6760 },
      { name: "JP Nagar", latitude: 12.9105, longitude: 77.5857 },
      { name: "Mysore", latitude: 12.2958, longitude: 76.6394 },
      { name: "Hubli", latitude: 15.3647, longitude: 75.1240 },
      { name: "Mangaluru", latitude: 12.9141, longitude: 74.8560 },
      { name: "Belagavi", latitude: 15.8497, longitude: 74.4977 },
      { name: "Ballari", latitude: 15.1394, longitude: 76.9214 },
      { name: "Shivamogga", latitude: 13.9299, longitude: 75.5681 },
      { name: "Tumakuru", latitude: 13.3409, longitude: 77.1006 },
      { name: "Davanagere", latitude: 14.4644, longitude: 75.9218 },
      { name: "Vijayapura", latitude: 16.8302, longitude: 75.7100 },
      { name: "Kalaburagi", latitude: 17.3297, longitude: 76.8343 },
      { name: "Bidar", latitude: 17.9120, longitude: 77.5181 },
      { name: "Udupi", latitude: 13.3409, longitude: 74.7421 },
      { name: "Hassan", latitude: 13.0068, longitude: 76.1026 },
      { name: "Chikmagalur", latitude: 13.3161, longitude: 75.7720 },
      { name: "Mandya", latitude: 12.5218, longitude: 76.8971 },
      { name: "Kolar", latitude: 13.1368, longitude: 78.1292 },
      { name: "Chitradurga", latitude: 14.2251, longitude: 76.3996 },
      { name: "Bagalkot", latitude: 16.1811, longitude: 75.6958 }
    ]
  },
  {
    name: "Kerala",
    type: "State",
    cities: [
      { name: "Kochi", latitude: 9.9312, longitude: 76.2673 },
      { name: "Thiruvananthapuram", latitude: 8.5241, longitude: 76.9366 },
      { name: "Kozhikode", latitude: 11.2588, longitude: 75.7804 },
      { name: "Thrissur", latitude: 10.5276, longitude: 76.2144 },
      { name: "Alappuzha", latitude: 9.4981, longitude: 76.3388 },
      { name: "Kollam", latitude: 8.8932, longitude: 76.6141 },
      { name: "Palakkad", latitude: 10.7867, longitude: 76.6547 },
      { name: "Malappuram", latitude: 11.0720, longitude: 76.0740 },
      { name: "Kannur", latitude: 11.8745, longitude: 75.3704 },
      { name: "Kottayam", latitude: 9.5916, longitude: 76.5222 },
      { name: "Idukki", latitude: 9.8510, longitude: 76.9740 },
      { name: "Wayanad", latitude: 11.6854, longitude: 76.1320 }
    ]
  },
  {
    name: "Madhya Pradesh",
    type: "State",
    cities: [
      { name: "Indore", latitude: 22.7196, longitude: 75.8577 },
      { name: "Bhopal", latitude: 23.2599, longitude: 77.4126 },
      { name: "Gwalior", latitude: 26.2183, longitude: 78.1828 },
      { name: "Jabalpur", latitude: 23.1815, longitude: 79.9864 },
      { name: "Ujjain", latitude: 23.1760, longitude: 75.7885 },
      { name: "Sagar", latitude: 23.8388, longitude: 78.7378 },
      { name: "Ratlam", latitude: 23.3315, longitude: 75.0367 },
      { name: "Rewa", latitude: 24.5349, longitude: 81.3033 },
      { name: "Satna", latitude: 24.5764, longitude: 80.8322 }
    ]
  },
  {
    name: "Maharashtra",
    type: "State",
    cities: [
      { name: "Mumbai", latitude: 19.0760, longitude: 72.8777 },
      { name: "Pune", latitude: 18.5204, longitude: 73.8567 },
      { name: "Nagpur", latitude: 21.1458, longitude: 79.0882 },
      { name: "Nashik", latitude: 19.9975, longitude: 73.7898 },
      { name: "Thane", latitude: 19.2183, longitude: 72.9781 },
      { name: "Chhatrapati Sambhajinagar", latitude: 19.8762, longitude: 75.3433 },
      { name: "Solapur", latitude: 17.6599, longitude: 75.9064 },
      { name: "Amravati", latitude: 20.9374, longitude: 77.7796 },
      { name: "Kolhapur", latitude: 16.7050, longitude: 74.2433 },
      { name: "Nanded", latitude: 19.1383, longitude: 77.3210 },
      { name: "Jalgaon", latitude: 21.0074, longitude: 75.5626 },
      { name: "Akola", latitude: 20.7002, longitude: 77.0082 },
      { name: "Sangli", latitude: 16.8524, longitude: 74.5815 },
      { name: "Satara", latitude: 17.6805, longitude: 73.9918 },
      { name: "Latur", latitude: 18.4088, longitude: 76.5604 },
      { name: "Chandrapur", latitude: 19.9515, longitude: 79.2961 },
      { name: "Ratnagiri", latitude: 16.9902, longitude: 73.3120 }
    ]
  },
  {
    name: "Manipur",
    type: "State",
    cities: [
      { name: "Imphal", latitude: 24.8170, longitude: 93.9368 },
      { name: "Churachandpur", latitude: 24.3312, longitude: 93.6841 },
      { name: "Thoubal", latitude: 24.6420, longitude: 93.9982 }
    ]
  },
  {
    name: "Meghalaya",
    type: "State",
    cities: [
      { name: "Shillong", latitude: 25.5788, longitude: 91.8831 },
      { name: "Tura", latitude: 25.5141, longitude: 90.2241 },
      { name: "Jowai", latitude: 25.4411, longitude: 92.2031 }
    ]
  },
  {
    name: "Mizoram",
    type: "State",
    cities: [
      { name: "Aizawl", latitude: 23.7271, longitude: 92.7176 },
      { name: "Lunglei", latitude: 22.8812, longitude: 92.7341 }
    ]
  },
  {
    name: "Nagaland",
    type: "State",
    cities: [
      { name: "Kohima", latitude: 25.6751, longitude: 94.1086 },
      { name: "Dimapur", latitude: 25.9064, longitude: 93.7266 },
      { name: "Mokokchung", latitude: 26.3262, longitude: 94.5120 }
    ]
  },
  {
    name: "Odisha",
    type: "State",
    cities: [
      { name: "Bhubaneswar", latitude: 20.2961, longitude: 85.8245 },
      { name: "Cuttack", latitude: 20.4625, longitude: 85.8830 },
      { name: "Rourkela", latitude: 22.2604, longitude: 84.8536 },
      { name: "Sambalpur", latitude: 21.4669, longitude: 83.9812 },
      { name: "Puri", latitude: 19.8135, longitude: 85.8312 },
      { name: "Balasore", latitude: 21.4934, longitude: 86.9337 },
      { name: "Berhampur", latitude: 19.3150, longitude: 84.7941 }
    ]
  },
  {
    name: "Punjab",
    type: "State",
    cities: [
      { name: "Ludhiana", latitude: 30.9010, longitude: 75.8573 },
      { name: "Amritsar", latitude: 31.6340, longitude: 74.8723 },
      { name: "Jalandhar", latitude: 31.3260, longitude: 75.5762 },
      { name: "Patiala", latitude: 30.3400, longitude: 76.3800 },
      { name: "Bathinda", latitude: 30.2110, longitude: 74.9454 },
      { name: "Mohali", latitude: 30.7046, longitude: 76.7179 },
      { name: "Pathankot", latitude: 32.2689, longitude: 75.6495 }
    ]
  },
  {
    name: "Rajasthan",
    type: "State",
    cities: [
      { name: "Jaipur", latitude: 26.9124, longitude: 75.7873 },
      { name: "Jodhpur", latitude: 26.2389, longitude: 73.0243 },
      { name: "Udaipur", latitude: 24.5854, longitude: 73.7125 },
      { name: "Kota", latitude: 25.1800, longitude: 75.8300 },
      { name: "Bikaner", latitude: 28.0194, longitude: 73.3139 },
      { name: "Ajmer", latitude: 26.4491, longitude: 74.6387 },
      { name: "Alwar", latitude: 27.5530, longitude: 76.6084 },
      { name: "Bhilwara", latitude: 25.3412, longitude: 74.6412 },
      { name: "Sikar", latitude: 27.6119, longitude: 75.1499 },
      { name: "Jaisalmer", latitude: 26.9157, longitude: 70.9083 },
      { name: "Bharatpur", latitude: 27.2152, longitude: 77.5030 },
      { name: "Pali", latitude: 25.7713, longitude: 73.3234 }
    ]
  },
  {
    name: "Sikkim",
    type: "State",
    cities: [
      { name: "Gangtok", latitude: 27.3314, longitude: 88.6138 },
      { name: "Namchi", latitude: 27.1685, longitude: 88.3562 },
      { name: "Gyalshing", latitude: 27.2831, longitude: 88.2711 }
    ]
  },
  {
    name: "Tamil Nadu",
    type: "State",
    cities: [
      { name: "Chennai", latitude: 13.0827, longitude: 80.2707 },
      { name: "Coimbatore", latitude: 11.0168, longitude: 76.9558 },
      { name: "Madurai", latitude: 9.9252, longitude: 78.1198 },
      { name: "Tiruchirappalli", latitude: 10.7905, longitude: 78.7047 },
      { name: "Salem", latitude: 11.6643, longitude: 78.1460 },
      { name: "Tirunelveli", latitude: 8.7139, longitude: 77.7567 },
      { name: "Vellore", latitude: 12.9165, longitude: 79.1325 },
      { name: "Erode", latitude: 11.3410, longitude: 77.7172 },
      { name: "Thoothukudi", latitude: 8.7973, longitude: 78.1348 },
      { name: "Thanjavur", latitude: 10.7870, longitude: 79.1378 },
      { name: "Kanchipuram", latitude: 12.8387, longitude: 79.7016 },
      { name: "Tiruppur", latitude: 11.1085, longitude: 77.3411 },
      { name: "Dindigul", latitude: 10.3673, longitude: 77.9803 },
      { name: "Nagercoil", latitude: 8.1830, longitude: 77.4119 },
      { name: "Cuddalore", latitude: 11.7480, longitude: 79.7714 }
    ]
  },
  {
    name: "Telangana",
    type: "State",
    cities: [
      { name: "Hyderabad", latitude: 17.3850, longitude: 78.4867 },
      { name: "Warangal", latitude: 17.9689, longitude: 79.5941 },
      { name: "Nizamabad", latitude: 18.6725, longitude: 78.0941 },
      { name: "Karimnagar", latitude: 18.4386, longitude: 79.1288 },
      { name: "Khammam", latitude: 17.2473, longitude: 80.1514 },
      { name: "Ramagundam", latitude: 18.7617, longitude: 79.4312 },
      { name: "Mahabubnagar", latitude: 16.7367, longitude: 77.9889 },
      { name: "Nalgonda", latitude: 17.0500, longitude: 79.2700 },
      { name: "Adilabad", latitude: 19.6667, longitude: 78.5333 }
    ]
  },
  {
    name: "Tripura",
    type: "State",
    cities: [
      { name: "Agartala", latitude: 23.8315, longitude: 91.2868 },
      { name: "Dharmanagar", latitude: 24.3667, longitude: 92.1667 },
      { name: "Udaipur", latitude: 23.5333, longitude: 91.4833 }
    ]
  },
  {
    name: "Uttar Pradesh",
    type: "State",
    cities: [
      { name: "Lucknow", latitude: 26.8467, longitude: 80.9462 },
      { name: "Kanpur", latitude: 26.4499, longitude: 80.3319 },
      { name: "Noida", latitude: 28.5355, longitude: 77.3910 },
      { name: "Varanasi", latitude: 25.3176, longitude: 82.9739 },
      { name: "Agra", latitude: 27.1767, longitude: 78.0081 },
      { name: "Ghaziabad", latitude: 28.6692, longitude: 77.4538 },
      { name: "Meerut", latitude: 28.9845, longitude: 77.7064 },
      { name: "Prayagraj", latitude: 25.4358, longitude: 81.8463 },
      { name: "Bareilly", latitude: 28.3640, longitude: 79.4150 },
      { name: "Aligarh", latitude: 27.8974, longitude: 78.0880 },
      { name: "Moradabad", latitude: 28.8351, longitude: 78.7749 },
      { name: "Saharanpur", latitude: 29.9640, longitude: 77.5460 },
      { name: "Gorakhpur", latitude: 26.7606, longitude: 83.3731 },
      { name: "Jhansi", latitude: 25.4484, longitude: 78.5685 },
      { name: "Muzaffarnagar", latitude: 29.4727, longitude: 77.7085 },
      { name: "Mathura", latitude: 27.4924, longitude: 77.6737 },
      { name: "Ayodhya", latitude: 26.7957, longitude: 82.1943 },
      { name: "Firozabad", latitude: 27.1500, longitude: 78.4200 }
    ]
  },
  {
    name: "Uttarakhand",
    type: "State",
    cities: [
      { name: "Dehradun", latitude: 30.3165, longitude: 78.0322 },
      { name: "Haridwar", latitude: 29.9457, longitude: 78.1642 },
      { name: "Rishikesh", latitude: 30.0869, longitude: 78.2676 },
      { name: "Nainital", latitude: 29.3803, longitude: 79.4636 },
      { name: "Haldwani", latitude: 29.2149, longitude: 79.5102 },
      { name: "Roorkee", latitude: 29.8543, longitude: 77.8880 }
    ]
  },
  {
    name: "West Bengal",
    type: "State",
    cities: [
      { name: "Kolkata", latitude: 22.5726, longitude: 88.3639 },
      { name: "Siliguri", latitude: 26.7271, longitude: 88.3953 },
      { name: "Asansol", latitude: 23.6889, longitude: 86.9749 },
      { name: "Durgapur", latitude: 23.5204, longitude: 87.3119 },
      { name: "Howrah", latitude: 22.5726, longitude: 88.3185 },
      { name: "Darjeeling", latitude: 27.0410, longitude: 88.2627 },
      { name: "Kharagpur", latitude: 22.3302, longitude: 87.3237 },
      { name: "Haldia", latitude: 22.0620, longitude: 88.0698 },
      { name: "Malda", latitude: 25.0108, longitude: 88.1411 }
    ]
  },
  // UNION TERRITORIES
  {
    name: "Andaman and Nicobar Islands",
    type: "Union Territory",
    cities: [
      { name: "Port Blair", latitude: 11.6234, longitude: 92.7265 }
    ]
  },
  {
    name: "Chandigarh",
    type: "Union Territory",
    cities: [
      { name: "Chandigarh", latitude: 30.7333, longitude: 76.7794 }
    ]
  },
  {
    name: "Dadra and Nagar Haveli and Daman and Diu",
    type: "Union Territory",
    cities: [
      { name: "Daman", latitude: 20.3974, longitude: 72.8328 },
      { name: "Silvassa", latitude: 20.2766, longitude: 73.0022 }
    ]
  },
  {
    name: "Delhi",
    type: "Union Territory",
    cities: [
      { name: "Delhi", latitude: 28.6139, longitude: 77.2090 },
      { name: "New Delhi", latitude: 28.6139, longitude: 77.2090 }
    ]
  },
  {
    name: "Jammu and Kashmir",
    type: "Union Territory",
    cities: [
      { name: "Srinagar", latitude: 34.0837, longitude: 74.7973 },
      { name: "Jammu", latitude: 32.7266, longitude: 74.8570 }
    ]
  },
  {
    name: "Ladakh",
    type: "Union Territory",
    cities: [
      { name: "Leh", latitude: 34.1526, longitude: 77.5771 }
    ]
  },
  {
    name: "Lakshadweep",
    type: "Union Territory",
    cities: [
      { name: "Kavaratti", latitude: 10.5669, longitude: 72.6417 }
    ]
  },
  {
    name: "Puducherry",
    type: "Union Territory",
    cities: [
      { name: "Puducherry", latitude: 11.9416, longitude: 79.8083 }
    ]
  }
];

// Helper to flatten all cities available in the dataset
export const ALL_INDIAN_CITIES = INDIA_STATES_AND_CITIES.reduce<string[]>((acc, state) => {
  state.cities.forEach(c => {
    if (!acc.includes(c.name)) {
      acc.push(c.name);
    }
  });
  return acc;
}, []).sort();

// Helper to find state for a given city
export const findStateForCity = (cityName: string): { state: string; type: string } => {
  for (const state of INDIA_STATES_AND_CITIES) {
    const found = state.cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
    if (found) {
      return { state: state.name, type: state.type };
    }
  }
  return { state: "All India", type: "State" };
};

// Coordinate coordinates dictionary for all listed cities
export const CITIES_COORDINATES: { [key: string]: { lat: number; lng: number } } = {};
INDIA_STATES_AND_CITIES.forEach((state) => {
  state.cities.forEach((city) => {
    CITIES_COORDINATES[city.name] = { lat: city.latitude, lng: city.longitude };
  });
});
