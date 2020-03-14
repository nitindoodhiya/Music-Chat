function myfunction(arr){
    console.log(arr);
}

$(document).ready(function () {

    $('form').on('submit', function () {
  
      var item = $('form input');
      var todo = { item: item.val() };
  
      $.ajax({
        type: 'POST',
        url: '/todo',
        data: todo,
        success: function (data) {
          //do something with the data via front-end framework
          location.reload();
        }
      });
  
      return false;
  
    });
  
    $('li').on('click', function () {
      var item = $(this).text().trim();
      $.ajax({
        type: 'POST',
        url: '/song/' + item,
        success: function (data) {
          console.log(data);
          //do something with the data via front-end framework
          location.reload();
        }
      });
    });
  });
  
function myfunction() {
    var x = document.getElementById('myText').value;    
    console.log(x);
}
