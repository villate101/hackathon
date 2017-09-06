var uploadfiles = document.querySelector('#fileinput');
uploadfiles.addEventListener('change', function () {
    var files = this.files;
    for(var i=0; i<files.length; i++){
        previewImage(this.files[i]);
    }

}, false);