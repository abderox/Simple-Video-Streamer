# Simple Video Streamer

This is a minimal Node.js app that streams videos from a local directory to connected devices on the same network. It is intended to be used for personal use only and does not have any advanced features or design.

## Prerequisites

Before running this app, you should have Node.js and npm (Node Package Manager) installed on your system.

## Installation

- Clone this repository to your local machine.

- Navigate to the project directory in your terminal or command prompt.

- Run the following command to install the necessary dependencies:
  
    `npm install`
- Open `app.js` and modify the `videosPath` constant to point to the directory containing your videos. By default, it's set to the `Downloads` folder in your home directory.

- Run the following command to start the app:
  
    `npm start`

## Usage

- Connect your device to the same network as the server.
- Open a web browser on your device and navigate to `http://[SERVER_IP]:3000/d`, replacing [SERVER_IP] with the IP address of the machine running the server.
-  You should now see a list of videos in the directory specified by videosPath.
- Click on a video to start streaming.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Notes

- This app is intended to be minimal and does not have any styling or advanced features.
- If you need to change the directory containing your videos, modify the videosPath constant in `app.js`.
- ⚠️ *For security reasons, do not expose this app to the public internet without proper authentication and authorization measures in place*.