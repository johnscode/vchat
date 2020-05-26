

// function solid_logout() {
//   solid.auth.logout().then(() => console.log('Goodbye!'));
// }

function do_logout() {
  var un = $('#un').val();
  var pw = $('#pw').val();
  let u = Cookies.getJSON('user');
  if (u) {
    $.ajax({
      url: "/v1/auth/" + u.user_id,
      headers: {
        'token':u.user_id
      },
      method: "DELETE",
      data: JSON.stringify({username: un, password: pw}),
      contentType: 'application/json',
      statusCode: {
        404: function () {
          console.log(`logout, user not recognized: ${un}`)
          $('#flash-message').text('Username or password was not correct');
          $('#flash').show();
        }
      },
      success: function (data) {
        console.log("success logout " + JSON.stringify(data))
      },
      error: function (e) {

      }
    }).done(function (data) {
      console.log("done logout result " + JSON.stringify(data))
      Cookies.remove('user')
      $('#flash').hide();
      $.ajaxSetup({
        headers: {'token': null}
      });
      window.location.replace(`/`);
    });
  } else {
    console.log("no user to logout")
  }
}

