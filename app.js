$(document ).ready(function() {

//  ○ Search your pinterest likes and pins
//    for shoppable products 
//  ○ Order by number of pins / likes /price
//  ○ narrow down by board/poster

//assign global variables
var signIn = $(".btn-signIn")
var signOut = $(".btn-signOut")
var token;
var pins = [];
var board = [];
var creator = [];
var $resultsContainer = $('#resultsContainer');
var $divs = $("#resultsContainer");
var username; 

setTimeout(function(){if(PDK.getSession()) {
  //if signed in
  getUsername();
  loadPage();
  } else {
  //if not signed in
  $(".signed-in-view").hide();
  $('.image-results-view').hide();
  }}, 300 );

  //signon button event listener
  signIn.on("click",function(e){
    e.preventDefault();
    PDK.login({
      scope:'read_public'
    }, callback);
  });

  //callback function for signing in
  var callback = function(resp){
    if(resp.error){
      console.error(resp.error);
      // if(resp.session){
      //   //console.info(resp.session);
      //   getUsername();
      //   loadPage();
      // }
    } else if(resp.session) {
      //console.info("resp session", resp.session);
      getUsername();
      $(".search-view").show();
      $(".image-results-view").show();
      loadPage();
    }
  };

  //add event listener for sign out button
  signOut.on("click", function(e){
    e.preventDefault();
    PDK.logout(callback2);
  });

  //callback function for signing out
  var callback2 = function(resp){
    $('.sign-in-view').show();
    $('.signed-in-view').hide();
    $('.image-results-view').hide();
    $('.search-view').hide()
    $resultsContainer.html('');
    $('signed-in-view span').html('')
    pins = [];
  }

  //fetch the username and display at the top of the page
  var getUsername = function(){
    token = PDK.getSession();

    $.ajax({
      url: "https://api.pinterest.com/v1/me/?access_token="+token.accessToken+"&fields=username%2Clast_name%2Cfirst_name",
      method: "GET",
      dataType: "jsonp",
      success: function(response) {
        username = response.data.username;
        var html = $('<span>You are signed in '+username+'!</span>');
        $(".signed-in-view span").html(html)
      }
    });
   }

  //event listener for sorting items by likes
  $('#click-likes').on('click', function(e) {
    e.preventDefault();
    var value1 = $('#board').val();
    var value2 = $('#creator').val();

    pins = pins.sort(function (a, b) {
      return parseInt(b.counts.likes) - parseInt(a.counts.likes);
    });

    showPins(function(item){
      //long predicate... compares the value in the dropdown to the items that are being displayed using the showPins function 
      return (item.board.name === value1 && item.creator.first_name+" "+item.creator.last_name === value2) || (item.board.name === value1 && value2 === 'select') || ( value1 === 'select' && item.creator.first_name+" "+item.creator.last_name === value2) || (value1 === 'select' && value2 === 'select') || (value1 ==='select' && item.creator.first_name+" "+item.creator.last_name === value2)
    })
  });

  //event listener for sorting items by number of repins
  $('#click-repins').on('click', function(e) {
    e.preventDefault();
    var value1 = $('#board').val();
    var value2 = $('#creator').val();
    pins = pins.sort(function (a, b) {
      return parseInt(b.counts.repins) - parseInt(a.counts.repins);
    });
    showPins(function(item){
      //same long predicate
      return (item.board.name === value1 && item.creator.first_name+" "+item.creator.last_name === value2) || (item.board.name === value1 && value2 === 'select') || ( value1 === 'select' && item.creator.first_name+" "+item.creator.last_name === value2 ) || (value1 === 'select' && value2 === 'select') || (value1 ==='select' && item.creator.first_name+" "+item.creator.last_name === value2)
      });
  });

  //event listener for sorting items by price (uses the lower price when there is a range of prices for an item)
  $('#click-price').on('click', function(e) {
    e.preventDefault();
    var value1 = $('#board').val();
    var value2 = $('#creator').val();

    pins = pins.sort(function (a, b) {
      aPrice = setPrice(a).replace("$", " ").replace(" and up", "")
      bPrice = setPrice(b).replace("$", " ").replace(" and up", "")
      return parseInt(aPrice) - parseInt(bPrice);
    });
    showPins(function(item){
      return (item.board.name === value1 && item.creator.first_name+" "+item.creator.last_name === value2) || (item.board.name === value1 && value2 === 'select') || ( value1 === 'select' && item.creator.first_name+" "+item.creator.last_name === value2 ) || (value1 === 'select' && value2 === 'select') || (value1 ==='select' && item.creator.first_name+" "+item.creator.last_name === value2)
      });
  });

  //filters by the name of the board
  $('#board').on('change',function(e) {
  //  e.preventDefault();
    var value = $(this).val();
    var value2 = $('#creator').val();
    showPins(function(item){
      return (item.board.name === value && item.creator.first_name+" "+item.creator.last_name === value2) || (item.board.name === value && value2 === 'select') || (value==='select' && value2 === 'select') || (value ==='select' && item.creator.first_name+" "+item.creator.last_name === value2)
    });
  });

  //filters by the name of the creator
  $('#creator').on('change',function(e) {
  //  e.preventDefault();
    var value = $(this).val();
    var value2 = $('#board').val();

    showPins(function(item){
      return (item.creator.first_name+" "+item.creator.last_name === value && item.board.name === value2) || (item.creator.first_name+" "+item.creator.last_name === value && value2 === 'select')|| (value ==='select' && value2 === 'select') || (value ==='select' && item.board.name === value2)
    });
  });

  //function for showing the pins in the results takes a predicate
  function showPins(predicate) {
    $resultsContainer.html('');
    //console.log(pins)
    pins.forEach(function(pin){
      if(predicate === undefined || predicate(pin)){
        showPin(pin);
      }
    });
    //add event listener for toggling description view here
    $('.products').on('click', function(){
      $(this).toggleClass('show-description');
    });
  };

  // function evaluateBoard(a, value) {
  //     var r = [];
  //     for (var i = 0; i < a.length; i++)
  //         if (a[i].board.name = value){
  //           r.push(a[i]);
  //         }        
  //     return r;
  // }

  //function for loading and initiating the page
  function loadPage() {

    setTimeout(function(){
      if(PDK.getSession()){
        $('.sign-in-view').hide();
        $('.signed-in-view').show();
        token = PDK.getSession();
        //gets the pins of the user
        var url = "https://api.pinterest.com/v1/me/pins/?access_token="+token.accessToken+"&fields=id%2Clink%2Cnote%2Curl%2Cattribution%2Cboard%2Cimage%2Ccolor%2Ccounts%2Ccreated_at%2Ccreator%2Coriginal_link%2Cmetadata%2Cmedia";

        //gets the likes of the user
        var url2 = "https://api.pinterest.com/v1/me/likes/?access_token="+token.accessToken+"&fields=id%2Clink%2Cnote%2Curl%2Cmedia%2Cmetadata%2Coriginal_link%2Ccreator%2Ccreated_at%2Ccounts%2Cboard%2Cattribution%2Cimage%2Ccolor"

        callAjax(url, function(){
          callAjax(url2, function(){
            showPins();
            showDropdown();
          });
        });

      }
      else {
        $('.image-results-view').hide();
        $('.search-view').hide()
      }
    }, 200)
  }

  //returns if the pin is a product
  function isShoppable(pin) {
    return (pin.metadata.product) ? true : false;
  }

  //gets the dropdown items 
  function showDropdown() {
    $('#board').html('');
    $('#creator').html('');
    //console.log($("#board").html())
    // resave board and creator arrays with distinct items
    board = ArrNoDupe(board);
    creator = ArrNoDupe(creator);

    board.forEach(addBoardDropdown);
    creator.forEach(addCreatorDropdown);
  }

  function addBoardDropdown(board) {
    var html = $('<option value="'+board+'">'+board+'</option>');
    $('#board').append(html);
  }

  function addCreatorDropdown(creator) {
    var html = $('<option value="'+creator+'">'+creator+'</option>');
    $('#creator').append(html);
  }

  //function for creating an array of unique elements 
  function ArrNoDupe(a) {
      var temp = {};
      for (var i = 0; i < a.length; i++)
          temp[a[i]] = true;
      var r = ['select'];
      for (var k in temp)
          r.push(k);
      return r;
  }

  //funciton for showing each pin on the page
  function showPin(pin){
    var imageUrl = pin.image.original.url;
    var itemName = pin.metadata.product.name;
    var price = setPrice(pin);
    var desc = createDesc(pin);
    var likes = pin.counts.likes;
    var repins = pin.counts.repins;
    var repinImg = '<img src ="https://www.punchbowl.com/gridfs/fs/51801c6614f09201f200026b-1367350375" style="width:10px;height:10px; align:middle">'
    var board = pin.board.name;
    var creator = pin.creator.first_name+" "+pin.creator.last_name;
    var html = $('<div class="products" id="' + pin.id +'";><p id="attributes"><span class="heart">♥ </span>'+likes+" "+repinImg+" "+repins+'<span class="board"> '+board+' by '+creator+'</span></p><p>'+itemName+'<span class="price" name="'+pin.id+'">'+price+'</span><br/><small>'+desc+'</small></p></div>');
    $resultsContainer.append(html);
    $("#"+pin.id).css('background-image', 'url("'+imageUrl+'")');

    var buyLink = pin.original_link;
    $("span[name='"+pin.id+"']").wrap('<a href="'+buyLink+'"target="_blank"/>');
  }

  //function for creating a snippet of the description - if shorter than 275 characters, remains same, and truncates if longer 
  function createDesc(pin) {
    if(pin.metadata.link.description.length>275){ 
      return pin.metadata.link.description.substring(0, 275)+"...";
    } else return pin.metadata.link.description;
  }

  //function for getting the price or the min price for a product so they can be compared / displayed
  function setPrice(pin){
    if (pin.metadata.product.offer.price){
      return pin.metadata.product.offer.price;
    } else if (pin.metadata.product.offer.min_price){
      return pin.metadata.product.offer.min_price+" and up";  
    }
  }
  //function for the ajax call - can be used for either likes or repins url in the loadpage function
  function callAjax(url, cb){
    var index = 0;
    var index2 = 0;
    $.ajax({
      url: url,
      method: "GET",
      dataType: "jsonp",
      success: function(response) {
        var data = response.data;
        data.forEach(function(pin){
          if(isShoppable(pin)){
            pins.push(pin); 
            board.push(pin.board.name);
            creator.push(pin.creator.first_name+" "+pin.creator.last_name);
          }
        });
        cb();
      }
    });
  }

});
