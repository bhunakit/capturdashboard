const cameraData = [
  {
    id: 1,
    location: [100.51946, 13.75793],
    landmarks: ["Central Mall", "City Park"],
    people: {
      minute: 12,
      hour: 157,
      day: 2435,
      week: 15782
    },
    cars: {
      minute: 3,
      hour: 43, 
      day: 652,
      week: 4208
    },
    environment: {
      am: {
        humidity: "65%",
        airQuality: "AQI: 82"
      },
      pm: {
        humidity: "58%",
        airQuality: "AQI: 105"
      }
    },
    // Vehicle type breakdown
    vehicleBreakdown: {
      cars: 68,
      trucks: 12,
      motorcycles: 15,
      buses: 5
    },
    // Historical data for charts
    trafficTrends: [
      { time: "6am", people: 68, vehicles: 28 },
      { time: "9am", people: 185, vehicles: 62 },
      { time: "12pm", people: 152, vehicles: 41 },
      { time: "3pm", people: 126, vehicles: 47 },
      { time: "6pm", people: 214, vehicles: 58 },
      { time: "9pm", people: 94, vehicles: 22 }
    ]
  },
  {
    id: 2,
    location: [100.48546, 13.74293],
    landmarks: ["Lotus Hotel", "Business Center"],
    people: {
      minute: 18,
      hour: 234,
      day: 3250,
      week: 21548
    },
    cars: {
      minute: 8,
      hour: 87, 
      day: 1048,
      week: 6721
    },
    environment: {
      am: {
        humidity: "72%",
        airQuality: "AQI: 45"
      },
      pm: {
        humidity: "67%",
        airQuality: "AQI: 75"
      }
    },
    // Vehicle type breakdown
    vehicleBreakdown: {
      cars: 52,
      trucks: 18,
      motorcycles: 25,
      buses: 5
    },
    // Historical data for charts
    trafficTrends: [
      { time: "6am", people: 95, vehicles: 52 },
      { time: "9am", people: 279, vehicles: 130 },
      { time: "12pm", people: 238, vehicles: 79 },
      { time: "3pm", people: 187, vehicles: 87 },
      { time: "6pm", people: 324, vehicles: 114 },
      { time: "9pm", people: 141, vehicles: 43 }
    ]
  },
  {
    id: 3,
    location: [100.50146, 13.76593],
    landmarks: ["Grand Hospital", "Central Bank"],
    people: {
      minute: 8,
      hour: 103,
      day: 1562,
      week: 10784
    },
    cars: {
      minute: 2,
      hour: 31, 
      day: 472,
      week: 3105
    },
    environment: {
      am: {
        humidity: "68%",
        airQuality: "AQI: 92"
      },
      pm: {
        humidity: "64%",
        airQuality: "AQI: 130"
      }
    },
    // Vehicle type breakdown
    vehicleBreakdown: {
      cars: 58,
      trucks: 8,
      motorcycles: 30,
      buses: 4
    },
    // Historical data for charts
    trafficTrends: [
      { time: "6am", people: 42, vehicles: 19 },
      { time: "9am", people: 124, vehicles: 46 },
      { time: "12pm", people: 105, vehicles: 28 },
      { time: "3pm", people: 82, vehicles: 31 },
      { time: "6pm", people: 143, vehicles: 40 },
      { time: "9pm", people: 62, vehicles: 15 }
    ]
  },
  {
    id: 4,
    location: [100.52846, 13.73893],
    landmarks: ["Central Station", "Shopping District"],
    people: {
      minute: 14,
      hour: 187,
      day: 2798,
      week: 18923
    },
    cars: {
      minute: 5,
      hour: 62, 
      day: 845,
      week: 5782
    },
    environment: {
      am: {
        humidity: "70%",
        airQuality: "AQI: 55"
      },
      pm: {
        humidity: "62%",
        airQuality: "AQI: 88"
      }
    },
    // Vehicle type breakdown
    vehicleBreakdown: {
      cars: 45,
      trucks: 22,
      motorcycles: 18,
      buses: 15
    },
    // Historical data for charts
    trafficTrends: [
      { time: "6am", people: 75, vehicles: 38 },
      { time: "9am", people: 224, vehicles: 93 },
      { time: "12pm", people: 187, vehicles: 56 },
      { time: "3pm", people: 149, vehicles: 62 },
      { time: "6pm", people: 262, vehicles: 80 },
      { time: "9pm", people: 112, vehicles: 31 }
    ]
  }
];

export default cameraData;