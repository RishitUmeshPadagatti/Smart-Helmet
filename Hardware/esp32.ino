#include <TinyGPSPlus.h>

// ---------------- PIN DEFINITIONS ----------------
#define GPS_RX 16
#define GPS_TX 17

#define PI_TX  25     // ESP32 → Raspberry Pi (TX only)

#define MQ135_PIN 34
#define MQ7_PIN   35
// -------------------------------------------------

TinyGPSPlus gps;

HardwareSerial gpsSerial(2);   // UART2 → GPS
HardwareSerial piSerial(1);    // UART1 → Raspberry Pi (TX only)

unsigned long lastSend = 0;
float speed_kmph = 0.0;

// ================= SETUP ===================
void setup() {
  Serial.begin(115200);
  delay(1000);

  // GPS
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);

  // Raspberry Pi UART
  piSerial.begin(9600, SERIAL_8N1, -1, PI_TX);

  Serial.println("SMART HELMET READY (GPS + AQI MODE)");
}

// ================= LOOP ===================
void loop() {
  readGPS();
  updateSpeed();

  // Send data every 2 seconds
  if (millis() - lastSend > 2000) {
    lastSend = millis();
    sendData();
  }
}

// ================= FUNCTIONS ===================

// -------- GPS ----------
void readGPS() {
  while (gpsSerial.available()) {
    gps.encode(gpsSerial.read());
  }
}

// -------- SPEED ----------
void updateSpeed() {
  if (gps.speed.isValid()) {
    speed_kmph = gps.speed.kmph();
  } else {
    speed_kmph = 0.0;
  }
}

// -------- AQI ----------
int readAQI() {
  int mq135 = analogRead(MQ135_PIN);
  int mq7   = analogRead(MQ7_PIN);
  return map((mq135 + mq7) / 2, 0, 4095, 0, 500);
}

// -------- SEND DATA ----------
void sendData() {
  String data = "";

  data += "SPD=" + String(speed_kmph, 1);
  data += ",AQI=" + String(readAQI());

  if (gps.location.isValid()) {
    data += ",LAT=" + String(gps.location.lat(), 6);
    data += ",LON=" + String(gps.location.lng(), 6);
  } else {
    data += ",LAT=NA,LON=NA";
  }

  // USB Serial Monitor
  Serial.println(data);

  // Raspberry Pi UART
  piSerial.println(data);
}