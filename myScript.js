function myFunction() {
  var inputValue = document.getElementById("site").value;
  $.ajax({
    type: "POST",
    url: '/trace',
    data: inputValue,
    success: function (d) {
      console.log("response from server: " + d);
    },
    dataType: 'text'
  });
}