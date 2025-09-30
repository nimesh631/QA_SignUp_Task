# QA Signup Automation Script

## OverView

This project automates the signup process of the Authorized Partner Website
.
The automation covers the entire signup flow without manual intervention, including:

- Opening the login page

- Clicking the sign-up link

- Creating an account with dynamically generated details (email via Mail.tm API, phone number, first name, last name, password, confirm password)

- Verifying OTP via Mail.tm API

- Filling agency details

- Adding professional experience

- Adding verification and preference details

- Uploading the required file


---


## Prerequisites
- **Node.js**: v18 or later
- **Chrome Browser**: v126+ (latest stable recommended)
- **ChromeDriver**: matching installed Chrome version
- **Internet connection**


---


## Setup Instructions

1. Clone the repository:
    ``` bash
    git clone https://github.com/nimesh631/QA_SignUp_Task.git
    cd QA_SignUp_Task

2. Install dependencies:

    npm install selenium-webdriver axios


3. Run the Script

    node signup_automation_script.js


---


## Environment / Setup

Language: JavaScript (Node.js)

Framework: Selenium WebDriver

Extra Library: Axios (for Mail.tm API requests)

Driver: ChromeDriver v140


---


## Test Data

- Email: Generated dynamically via Mail.tm API
- Phone Number: Randomly generated starting with 98
- Password: Test@1234
- File: test.pdf


---


### Test Report

[Test Report](./test_report.pdf)

### Demo Video

[Demo Video](./demo_video.mp4)