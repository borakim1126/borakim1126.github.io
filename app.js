$(function(){

  var clickMe = $(".btn-default")

  clickMe.on("click",function(e){
    e.preventDefault();
    PDK.login({
      scope:'read_public'
    }, callback);
  });

  var callback = function(resp){
    if(resp.error){
      console.error(resp.error);
    } else if(resp.session) {
      console.info(resp.session);
      var token = PDK.getSession();
      if(token.accessToken){
        $('.sign-in-view').hide();
        var url = "https://api.pinterest.com/v1/oauth/token?grant_type=authorization_code&client_id=4826032574203707802&client_secret=956a6143b1e798674eecdb4e5e9c1b58f9cadfcc6f2fd02094116ab8a0b2630d&code="+token;
 
      } else {
        //do your thing
         }

    }
  };

//  ○ Search Pinterest posts by hastag / poster / board /color
// ○ Shoppable pins
//  ○ Order by number of pins / likes
 
});
