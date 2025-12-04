// Quick script to show QR code for Expo connection
const qr = require('qrcode-terminal');

const localIP = '192.168.4.150';
const port = '8081';
const expoUrl = `exp://${localIP}:${port}`;
const httpUrl = `http://${localIP}:${port}`;

console.log('\n📱 Expo Development Server Connection\n');
console.log('='.repeat(50));
console.log('Scan this QR code with Expo Go app:\n');
qr.generate(expoUrl, { small: true }, function (qrcode) {
  console.log(qrcode);
});
console.log('\n' + '='.repeat(50));
console.log(`\nConnection URL: ${expoUrl}`);
console.log(`HTTP URL: ${httpUrl}`);
console.log('\n📲 To connect:');
console.log('   1. Install Expo Go app on your phone');
console.log('   2. Scan the QR code above');
console.log('   3. Or enter the URL manually in Expo Go');
console.log('\n💻 Or press:');
console.log('   • Press "i" for iOS Simulator');
console.log('   • Press "a" for Android Emulator');
console.log('   • Press "w" for Web Browser\n');



