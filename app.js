window.onload = function{

  var clickMe = $(".btn-default")
  var callback;
  clickMe.on("click",function(e){
   // e.preventdefault();
    PDK.login({scope:'read_public', callback})});


  function isHashPresent() {
    if(window.location.search == "") {
      return false;
    } else {
      return true;
    }
  }
  if(isHashPresent()) {
     $('.sign-in-view').hide();
      var accessToken = window.location.search.replace('?state=768uyFys&code=', '')
      var url = "https://api.pinterest.com/v1/oauth/token?grant_type=authorization_code&client_id=4826032574203707802&client_secret=956a6143b1e798674eecdb4e5e9c1b58f9cadfcc6f2fd02094116ab8a0b2630d&code="+accessToken;

      
  } else {
    $('.sign-in-view').show();
    $('.image-results-view').hide();
  }


//  ○ Search Pinterest posts by hastag / poster / board /color
// ○ Shoppable pins
//  ○ Order by number of pins / likes
 
}
