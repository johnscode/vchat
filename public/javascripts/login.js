

var form  = document.getElementsByTagName('form')[0];

function do_login() {
  var un = $('#un').val();
  var pw = $('#pw').val();
  Cookies.remove('user')
  $.ajax({
    url:"/v1/auth/local",
    method:"POST",
    data : JSON.stringify({username:un,password:pw}),
    contentType : 'application/json',
    statusCode: {
      404: function() {
        console.log(`user not recognized: ${un}`)
        $('#flash-message').text('Username or password was not correct');
        $('#flash').show();
      },
      403: function() {
        console.log(`probably bad password: ${un}`)
        $('#flash-message').text('probably password was not correct');
        $('#flash').show();
      }
    },
    success: function(data) {
      console.log("success result "+JSON.stringify(data))
    },
    error:function(e) {

    }
  }).done(function(data) {
    console.log("done post result "+JSON.stringify(data))
    var user = JSON.stringify(data.user)
    sessionStorage.setItem("user",null) // store objs as json str
    console.log("done post user "+JSON.stringify(data.user))
    Cookies.set('user',data.user)
    $('#flash').hide();
    $.ajaxSetup({
      headers: { 'token': data.user.authToken }
    });
    window.location.replace(`/`);
  });
}

$( document ).ready(function() {
	// this is the login page, if there is a user in the session, then we already have a user
	// normally, we would't get here; just go to the home page
	console.log('login: cookie: '+JSON.stringify(Cookies.get()))
	let u = Cookies.getJSON('user');
	console.log('login: cookie user: '+(u ? u.username : 'no user'))
});
