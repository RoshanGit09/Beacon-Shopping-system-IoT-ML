#include <ArduinoBLE.h>  // Include the BLE library

void setup() {
  Serial.begin(115200);
  while (!Serial);  // Wait for Serial Monitor

  // Start BLE
  if (!BLE.begin()) {
    Serial.println("Starting BLE module failed!");
    while (1);
  }

  Serial.println("BLE Advertising...");

  // Set device name
  BLE.setLocalName("MyBLEBeacon");

  // Advertise "Hello" in manufacturer data
  byte message[] = { 'H', 'e', 'l', 'l', 'o' };
  BLE.setManufacturerData(message, sizeof(message));

  // Start advertising
  BLE.advertise();
}

void loop() {
  // Keep BLE active
  BLE.poll();
}
