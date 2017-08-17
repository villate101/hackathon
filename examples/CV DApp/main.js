window.addEventListener('load', function() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        console.log("Web3 detected!");
        window.web3 = new Web3(web3.currentProvider);
        // Now you can start your app & access web3 freely:
        var address = '0x78a3702dea33ed4bddd97645dd917ae0e5f25bc9';
        var contract = web3.eth.contract([{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"projects","outputs":[{"name":"name","type":"string"},{"name":"link","type":"string"},{"name":"description","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"operation","type":"bool"},{"name":"name","type":"string"},{"name":"link","type":"string"},{"name":"language","type":"string"}],"name":"editPublication","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"publications","outputs":[{"name":"name","type":"string"},{"name":"link","type":"string"},{"name":"language","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"key","type":"string"},{"name":"value","type":"string"}],"name":"setBasicData","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"operation","type":"bool"},{"name":"name","type":"string"},{"name":"link","type":"string"},{"name":"description","type":"string"}],"name":"editProject","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"skills","outputs":[{"name":"name","type":"string"},{"name":"level","type":"int32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"arg","type":"string"}],"name":"getBasicData","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"operation","type":"bool"},{"name":"name","type":"string"},{"name":"level","type":"int32"}],"name":"editSkill","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"arg","type":"string"}],"name":"getSize","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"operation","type":"bool"},{"name":"name","type":"string"},{"name":"speciality","type":"string"},{"name":"start","type":"int32"},{"name":"finish","type":"int32"}],"name":"editEducation","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"educations","outputs":[{"name":"name","type":"string"},{"name":"speciality","type":"string"},{"name":"year_start","type":"int32"},{"name":"year_finish","type":"int32"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"}]).at(address);
        contract.getBasicData('name',function (error, data) {
            $('#name').html(data);
        });
        contract.getBasicData('twitter', function(error, data){
           $('#twitter').html(data);
        });
        contract.getBasicData('github', function(error, data){
            $('#github').html(data);
        });
        contract.getBasicData('email', function(error, data){
            $('#email').html(data);
        });
        contract.getSize('educations', function(error,data){
            var size = data;
            var i = 0;
            while (i < size)
			{
			    contract.educations(i, function(err, data){
				    $('.education').append('' +
						'<div class="col-md-4 col-lg-4 col-sm-6 col-xs-12 item">' +
						'<p>Name: <span class="color">'+data[0]+'</span></p>' +
						'<p>Speciality: <span class="color">'+data[1]+'</span></p>' +
						'<p>Year started: <span class="color">'+data[2]['c']+'</span></p>' +
						'<p>Year finished: <span class="color">'+data[3]['c']+'</span></p>' +
						'</div>')
			    });
			    i++;
			}
        });
        contract.getSize('projects', function(err, data){
			var size = data;
			var i = 0;
			while (i < size)
			{
				contract.projects(i, function(err,data){
					$('.projects').append(
						'<div class="col-md-4 col-lg-4 col-sm-6 col-xs-12 item">' +
						'<p>Name: <span class="color">'+data[0]+'</span></p>' +
						'<p>Link: <span class="color">'+data[1]+'</span></p>' +
						'<p>Description: <span class="color">'+data[2]+'</span></p>')
				});
				i++;
			}
        });
        contract.getSize('publications', function(err, data){
            var size = data;
            var i = 0;
            while (i < size)
            {
                contract.publications(i, function(err,data){
                    $('.publications').append(
                        '<div class="col-md-4 col-lg-4 col-sm-6 col-xs-12 item">' +
                        '<p>Name: <span class="color">'+data[0]+'</span></p>' +
                        '<p>Link: <span class="color">'+data[1]+'</span></p>' +
                        '<p>Language: <span class="color">'+data[2]+'</span></p>')
                });
                i++;
            }
        });
    } else {
        $("#errorModal").modal("show");
    }
});
