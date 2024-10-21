# 🎵 PrimerPi

This project is a screen-free audio player for kids. It allows you to associate RFID tags with audio files and play them when the corresponding tag is scanned.


A few disclaimers:

- 🚨 PrimerPi is a DIY copycat of the [toniebox](https://tonies.com/en-eu/mainpage/) and the [Yoto player](https://uk.yotoplay.com/), though probably more expensive to build and not as good.
- 🥧 I built this on a Raspberry Pi 4 and used [balena](https://www.balena.io/) to deploy and manage the application. This is absolutely overkill and unnecessary, you can easily replicate the same functionality with a microcontroller. I just happened to have a spare Pi lying around and a bunch of audio code for I could reuse from previous projects.
- 🏴‍☠️ Something something about not pirating audio content.
- 🤖 This project, including this README file, was primarily generated with the assistance of Claude AI. It may contain bugs, inconsistencies, or suboptimal implementations. Use at your own risk and feel free to improve upon it as needed.


## 🛠️ Hardware required

- Raspberry Pi (any model will do)
- [RC522 RFID Reader module](https://www.amazon.com/SunFounder-Mifare-Reader-Arduino-Raspberry/dp/B07KGBJ9VG)
- RFID tags
- Speaker or audio output device - any speaker using the Raspberry Pi's 3.5mm audio jack will work


## 🧩 Components

The system consists of several components:

1. **RFID Reader**: A script that continuously scans for RFID tags using an RC522 RFID module.
2. **Audio Player**: A service responsible for playing audio files when triggered.
3. **Server**: A Node.js server that manages the RFID-to-audio file mappings and coordinates communication between components.
4. **Web Interface**: A simple web page for managing audio content and the RFID-to-audio file mappings.

## 🛠️ Setup

### Hardware Setup

Connect the RC522 sensor using the following diagram as a guide:
![RC522 wiring](images/wiring.png)

### Software Setup

This project uses balena to deploy the application to the Raspberry Pi. If you're not familiar with balena, you should [check it out](https://docs.balena.io/learn/welcome/introduction/) - it's a great platform for IoT device management. You are going to need to:
- Create a balena account
- Install the [balena CLI](https://docs.balena.io/reference/balena-cli/#install-the-cli)
- Create a new application on the [Balena dashboard](https://dashboard.balena-cloud.com/)

Then:
1. Clone this repository to your local machine.
2. Login to the balena CLI:
   ```
   balena login
   ```
3. Push the code to your Balena application:
   ```
   balena push <your-application-name>
   ```

Wait for the build to complete on your machine and the deployment to be completed. Once the build is uploaded to balenaCloud, the application will be deployed to your Raspberry Pi automatically.

If you're not using balena, you can still deploy this application manually to your Raspberry Pi. You'll need to set up Docker and Docker Compose on your Pi, then clone this repository and run `docker-compose up` in the project directory. Note that you might have to rename and edit the `Dockerfile.template` files to remove any usage of balena env vars like `%%BALENA_ARCH%%`.

## 🎯 Usage

1. Access the web interface by navigating to `http://<raspberry-pi-ip>:3000` in a web browser.
2. Use the web interface to add, edit, or remove RFID-to-audio file mappings.
3. Scan an RFID tag near the RC522 module. The system will automatically play the associated audio file.

## 🤝 Contributing

Contributions to improve the project are welcome. Please fork the repository and submit a pull request with your changes.

## 📄 License

This project is open-source and available under the MIT License.
