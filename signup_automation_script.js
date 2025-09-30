const { Builder, By, until } = require("selenium-webdriver");
const path = require("path");
const axios = require("axios");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createTempEmail() {
  const name = "testuser" + Date.now();
  const password = "Password123!";
  const domainResponse = await axios.get("https://api.mail.tm/domains");
  const domain = domainResponse.data["hydra:member"][0].domain;

  const email = `${name}@${domain}`;

  await axios.post("https://api.mail.tm/accounts", {
    address: email,
    password: password,
  });

  const tokenResponse = await axios.post("https://api.mail.tm/token", {
    address: email,
    password: password,
  });

  return {
    email,
    token: tokenResponse.data.token,
  };
}

async function getOTP(token) {
  console.log("Waiting 10s for OTP email...");
  await sleep(10000);

  const res = await axios.get("https://api.mail.tm/messages", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.data["hydra:member"].length === 0) {
    throw new Error("No OTP email found");
  }

  const msgId = res.data["hydra:member"][0].id;
  const msg = await axios.get(`https://api.mail.tm/messages/${msgId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = msg.data.text || msg.data.html;
  const match = body.match(/\d{4,6}/);
  return match ? match[0] : null;
}

function getRandomMobile() {
  return "98" + Date.now().toString().slice(-8);
}

async function signupAutomation() {
  let driver = await new Builder().forBrowser("chrome").build();
  let mobile = getRandomMobile();

  try {
    const mailbox = await createTempEmail();
    console.log("Temp email created:", mailbox.email);

    // Open login page
    await driver.get("https://authorized-partner.netlify.app/login");
    await sleep(2000);

    // Click Sign Up link
    await driver.wait(until.elementLocated(By.linkText("Sign Up")), 5000);
    await driver.findElement(By.linkText("Sign Up")).click();
    await sleep(500);

    // Agree terms
    await driver.wait(until.elementLocated(By.id("remember")), 5000);
    await driver.findElement(By.id("remember")).click();
    await sleep(2000);
    await driver.findElement(By.xpath("//button[text()='Continue']")).click();
    await sleep(500);

    // Step 1: Account setup
    await driver.wait(until.elementLocated(By.name("firstName")), 5000);
    await driver.findElement(By.name("firstName")).sendKeys("Test");
    await driver.findElement(By.name("lastName")).sendKeys("User");
    await driver.findElement(By.name("email")).sendKeys(mailbox.email);
    await driver.findElement(By.name("phoneNumber")).sendKeys(mobile);
    await driver.findElement(By.name("password")).sendKeys("Test@1234");
    await driver.findElement(By.name("confirmPassword")).sendKeys("Test@1234");
    await driver.findElement(By.xpath("//button[text()='Next']")).click();
    await sleep(500);

    // OTP
    let code = await getOTP(mailbox.token);
    if (!code) throw new Error("Verification code not received");
    await driver.wait(
      until.elementLocated(By.css('input[data-input-otp="true"]')),
      15000
    );
    let otpInput = await driver.findElement(
      By.css('input[data-input-otp="true"]')
    );
    await otpInput.sendKeys(code);

    await driver
      .findElement(By.xpath("//button[text()='Verify Code']"))
      .click();
    await sleep(500);

    // Step 2: Agency Details
    await driver.wait(until.elementLocated(By.name("agency_name")), 10000);
    await driver.findElement(By.name("agency_name")).sendKeys("Test Agency");
    await driver.findElement(By.name("role_in_agency")).sendKeys("Tester");
    await driver
      .findElement(By.name("agency_email"))
      .sendKeys("company@nepal.np");
    await driver.findElement(By.name("agency_website")).sendKeys("company.com");
    await driver.findElement(By.name("agency_address")).sendKeys("Kathmandu");
    await sleep(500);
    await driver
      .findElement(By.xpath("//button[contains(.,'Select Your Region')]"))
      .click();
    await sleep(1000);
    await driver.findElement(By.xpath("//*[contains(text(),'Nepal')]")).click();
    await driver.findElement(By.xpath("//button[text()='Next']")).click();
    await sleep(500);

    // Step 3: Professional Experience
    await driver.wait(
      until.elementLocated(By.css('select[aria-hidden="true"]')),
      15000
    );

    await driver.executeScript(`
      let sel=document.querySelector('select[aria-hidden="true"]');
      sel.value='3'; sel.dispatchEvent(new Event('change',{bubbles:true}));
    `);
    await driver
      .findElement(By.name("number_of_students_recruited_annually"))
      .sendKeys("100");
    await driver
      .findElement(By.name("focus_area"))
      .sendKeys("UnderGraduate Admissions");
    await driver.findElement(By.name("success_metrics")).sendKeys("80");
    await driver
      .findElement(By.xpath("//label[text()='Visa Processing']"))
      .click();
    await driver.findElement(By.xpath("//button[text()='Next']")).click();

    // Step 4: Verification and Preferences
    await driver.sleep(3000);
    await driver.wait(
      until.elementLocated(By.name("business_registration_number")),
      2000
    );
    await driver
      .findElement(By.name("business_registration_number"))
      .sendKeys("123456");
    await driver.sleep(5000);
    await driver
      .findElement(
        By.xpath(
          "//label[text()='Preferred Countries']/following-sibling::button"
        )
      )
      .click();
    await driver.findElement(By.xpath("//span[text()='Australia']")).click();
    await driver.actions().sendKeys("\uE00C").perform(); // ESC
    await driver.findElement(By.xpath("//label[text()='Colleges']")).click();

    // upload file
    const filePath = path.resolve(__dirname, "test.pdf");
    await driver.findElement(By.css("input[type='file']")).sendKeys(filePath);

    // submit
    await driver.findElement(By.xpath("//button[@type='submit']")).click();
    await sleep(2000);

    await driver.wait(until.urlContains("/admin/profile"), 30000);
    await sleep(10000);
    console.log("Signup automation completed successfully!");
  } catch (err) {
    console.error("Error during signup automation:", err);
  } finally {
    await driver.quit();
  }
}

signupAutomation();
