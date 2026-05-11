const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: "hrms-sheet@groovy-student-496005-q8.iam.gserviceaccount.com",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCtOKZhDWy6/2o8\nrJWZRXR4nfm5HufZ4M3RUuLlHd5JJmYioaw5aZoZIXVynK1Yv8SdsHaryx1rHMcI\nycyffUJJFuyBTRzw2s2JjUn8q/i69yjI8VgoZQeyxfCQr4yjS9B8FCy1m5K+SKCA\nZ4eDBlCWOuJMfrL05bJr0APyQqbLD1qFjP9TYjBbsfKrjoK+9ilVgletNo4SJMxp\n0UlmoPyuiETQuaUeElnsqF0b0o0iDu6G528Pj151iSH/OUJTnDDCc8b1VMTFKECY\nh5LLF3RUExlqBdtz9oWihxPoga/PTxpqRxBdM95bI5huGhReT+C8C7bPsydvgKhq\n3oJZ/M1dAgMBAAECggEAUr9sI5KxLUdULbXYJQbb077Li5Zq9VcBmww4XXD+Pf18\n7vBCgI6k0Xp9S4ny+SFqwFWK6xg1bnSp09XqzQmeP6IWytHWkGxFoX8AKBbS1CW7\nsvovveQ9YDZUbBmgWmWeK5fLn9m4qPOy0IQkZQAAQTPR5O7leD2+FOii6fjTCs76\nYjNP2cMKTb13N0Vlcr4eSSbsL+JX7bA4XzH30C/ZbQJo6W1HujVSURP9tzB0JRdk\nvFia9TzB9f4JvB9wg+Om5ArUvGW0OTVtXvRzxI9vL2IH2KebZFjNxpBflZe0nDCL\n5OkCx4NLzq3xilttLNxogZCuHQ7tij7JVo2gbCqodQKBgQDdZtSsG4pqnbWe1QV/\nQDo5F+C7TPukzrgMqRoouKHqzIckQ56/aBjMqS2D7p6e56cti0qkypVeYlTtKauq\nCkoXYzY0xCJxI0ziW35Q4545DnC+UyvD8Yfq+PoppWcytq9/Mfl+6mE73OcdHiG5\nUt1tDHJujD/0A5T9CgYYJ+o8+wKBgQDISl0VsXH3mYBa5aIenggIvslhpDfe73pG\nADMPOn9v2MxgnreJShgY3AmIMHKhNj82mJO2CE4PIY4CZYimk8elgVda8BAAnGwI\nSTSCIH2f7NysRAjnv123q+3DZY8wuzLwu253lIMDCC+LMrAyWmql4Il+tWnoJFPZ\nUpOfB4jfhwKBgB/UftLXisjVL51MJuQqibRXmHmVEcCZ75/yV85u7OhiyzMNfa8q\n+hXCZMbI8YkK6OAFXI/giCTvoiIOkZ16qTg/jTV81S7K0mzgloJulvrA9riGII6l\nFNNVRDHkk7eYyBZTSvlSHPSMR7XJ9TM9lJPu7Cy0gSVFto/CdynV4zktAoGAUnLa\nMq3i/kvAHKreu7/OCtuOxpT1Mt5d9Sbr3d70yrPyHev4HZnUpZcejWN0LIzKJM1W\nMN7mUzA65x2ozPmUe7rsnNCppba+egK4jMCXNhgpFvjCubN6/rrVm1PZR/QnmhVt\n+ee2rq7V83UgNvolYLc3omNHf3pE0fc+MX7Gh00CgYEAomtv2JViPPqOwawLHQQj\ngyePxRufZj2jnMMjc+OyNhOGJD8IN5N71bw93zgGvIW74ehg0n2tibshpR1h5f2C\nqZuONJMjvqFZnM4dHUQfHmx1Yggo6S4ulp1qy0oMDIDK2cKwHW5Jfi8ir7NMtrVO\nt0pWckyb1Nj49CZHJvkTYjM=\n-----END PRIVATE KEY-----\n"
  },
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

async function run() {
  try {
    const res = await sheets.spreadsheets.get({
      spreadsheetId: '1405uEknJ34x3SHdk9TtohWpiwNNJ-P6L29Z7oLHQOB4'
    });
    console.log("SHEETS:", res.data.sheets.map(s => s.properties.title));
  } catch(e) {
    console.error(e);
  }
}
run();
