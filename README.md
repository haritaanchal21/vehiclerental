# vehiclerental
app.get("/");  --> API to fetch application home page
app.get("/login");  --> API to fetch login form page
app.get("/landing");  --> API to fetch user landing page post successful login
app.get("/adminLanding");  --> API to fetch admin landing page post successful login
app.get("/vehicle");  --> API to fetch vehicle creation form page
app.get("/station");  --> API to fetch station creation form page
app.get("/station/list");  --> API to fetch stations for booking vehicle form page
app.get("/booking/list");  --> API to list all the bookings of loggedIn user
app.get("/logout");  --> API to logout
app.get("/station/assign");  --> API to fetch list of stations for assigning a vehicle form page for admin

app.post("/generateOtp");  --> API to generate otp
app.post("/login");  --> API to authenticate login
app.post("/station/register");  --> API to create new station for admin
app.post("/vehicle/register");  --> API to create new vehicle for admin
app.post("/inventory");  --> API to assign a vehicle to a station for admin
app.post("/station/list");  --> API to list all available vehicles at a particular station
app.post("/vehicle/book");  --> API to book a vehicle using qr code
app.post("/booking/return");  --> API to return a vehicle

