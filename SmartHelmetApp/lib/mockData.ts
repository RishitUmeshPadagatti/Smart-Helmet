export const currentUser = {
    name: "Mohith",
    rfid: "RFID12345",
    status: "active", // green dot
    avatarUrl: "https://github.com/shadcn.png", // dummy
    phoneNumber: "+91 78993 96101"
};

export const helmetData = {
    speed: 42,
    wearing: true,
    alcohol: false,
    accident: "normal", // normal | fall | impact
    battery: 87,
    mediaTrack: "Night Drive - Chill Mix",
    isEmergencyPressed: false,
};

export const locationData = {
    latitude: 12.9039167,
    longitude: 77.5069167,
    timestamp: new Date().toISOString(),
    speed: 42,
    direction: "NW",
};

export const familyMembers = [
    {
        id: 1, name: "Mom", location: {
            lat: 12.9362778,
            lng: 77.5182222
        }, status: "Not Driving"
    },
    {
        id: 2, name: "Dad", location: {
            lat: 13.0115833,
            lng: 77.5544722
        }, status: "Not Driving"
    },
];

export const incidents = [
    {
        id: 1,
        timestamp: "2023-10-24T14:30:00Z",
        severity: "High",
        location: "Main St & 4th Ave",
        thumbnail: "https://via.placeholder.com/150"
    },
    {
        id: 2,
        timestamp: "2023-10-20T09:15:00Z",
        severity: "Low",
        location: "Park Rd",
        thumbnail: "https://via.placeholder.com/150"
    },
];

export const impactData = {
    forceScore: 8.5, // out of 10
    injuryProb: "Low",
    fallDirection: "Left",
    tiltAngle: 45,
    history: [
        { time: "10:00", force: 2 },
        { time: "10:05", force: 3 },
        { time: "10:10", force: 8.5 }, // impact
        { time: "10:15", force: 0 },
    ]
};
