$(function(){
	var filemanager = $('.filemanager'),
		breadcrumbs = $('.breadcrumbs'),
		fileList = filemanager.find('.data');
		//fileList = filemanager.find('.dataContent');

	$( "#dialog" ).dialog({
		autoOpen: false,
		width: 800,
		height: 600,
		modal: true,
		show: {
			effect: "blind",
			duration: 100
		},
		hide: {
			effect: "blind",
			duration: 100
		},
		open: function() {
	        $('.overlay').addClass('custom-overlay');
	    },
	    close: function() {
	        $('.overlay').removeClass('custom-overlay');
	    }
	});

	var contentList,
		currentPath = '',
		breadcrumbsUrls = [];

	var folders = [],
		files = [];

	var orderType = 'date&desc=1',
		nbrContent = 36;

	var nbPageTot=1,
		currentPage=1;

	$( "body" ).on( "click", ".page-link", function( event ) {
		event.preventDefault();

		var hash1 = decodeURIComponent(window.location.hash).slice(1);

		if (typeof $(this).attr('prev') !== typeof undefined && $(this).attr('prev') !== false) {
			if(currentPage - 1 < 1){
				return;
			}else{
				currentPage-=1;
			}
		}else if (typeof $(this).attr('next') !== typeof undefined && $(this).attr('next') !== false) {
			if(currentPage + 1 > nbPageTot){
				return;
			}else{
				currentPage+=1;
			}
		}else{
			currentPage = $(this).html();
		}

		var hashForOrder = hash1+'?orderby='+orderType+"&nb="+nbrContent+"&p="+currentPage;
			//alert(hashForOrder);
			searchByPathAjax(hashForOrder).done(function(dataList){
					rendered = dataList;
						currentPath = hash1;
						breadcrumbsUrls = generateBreadcrumbs(hash1);

						render(rendered);

				});
	});

	$('a.orderLink').on('click', function(event){
		event.preventDefault();
		var hash1 = decodeURIComponent(window.location.hash).slice(1);

		if (typeof $(this).attr('orderby') !== typeof undefined && $(this).attr('orderby') !== false) {
	    orderType = $(this).attr('orderby');

			//remove class active
			$('.nav-item:has(a[orderby])').removeClass('active');
			currentPage=1;

		}else{
			nbrContent = $(this).attr('nbcontent');

			//remove class active
			$('.nav-item:has(a[nbcontent])').removeClass('active');
			currentPage=1;
		}

		$(this).parent().addClass('active');

		//hash = decodeURIComponent(hash).slice(1).split('=');
		var hashForOrder = hash1+'?orderby='+orderType+"&nb="+nbrContent+"&p="+currentPage;

		//alert(hashForOrder);
		searchByPathAjax(hashForOrder).done(function(dataList){
				rendered = dataList;
					currentPath = hash1;
					breadcrumbsUrls = generateBreadcrumbs(hash1);

					render(rendered);

			});



	});
	// This event listener monitors changes on the URL. We use it to
	// capture back/forward navigation in the browser.
	$(window).on('hashchange', function(){
		goto(window.location.hash);

		// We are triggering the event. This will execute
		// this function on page load, so that we show the correct folder:
	}).trigger('hashchange');

	// Hiding and showing the search box
	filemanager.find('.search').click(function(){

		var search = $(this);

		search.find('span').hide();
		search.find('input[type=search]').show().focus();

	});


	// Listening for keyboard input on the search field.
	// We are using the "input" event which detects cut and paste
	// in addition to keyboard input.

	filemanager.find('input').on('input', function(e){

		folders = [];
		files = [];

		var value = this.value.trim();

		if(value.length) {

			filemanager.addClass('searching');

			// Update the hash on every key stroke
			window.location.hash = 'search=' + value.trim();

		}

		else {

			filemanager.removeClass('searching');
			window.location.hash = encodeURIComponent(currentPath);

		}

	}).on('keyup', function(e){

		// Clicking 'ESC' button triggers focusout and cancels the search

		var search = $(this);

		if(e.keyCode == 27) {

			search.trigger('focusout');

		}

	}).focusout(function(e){

		// Cancel the search

		var search = $(this);

		if(!search.val().trim().length) {

			window.location.hash = encodeURIComponent(currentPath);
			search.hide();
			search.parent().find('span').show();

		}

	});


	// Clicking on folders

	fileList.on('click', 'div.folders', function(e){
		e.preventDefault();

		var nextDir = $(this).find('a.folders').attr('href');

		if(filemanager.hasClass('searching')) {

			// Building the breadcrumbs

			breadcrumbsUrls = generateBreadcrumbs(nextDir);

			filemanager.removeClass('searching');
			filemanager.find('input[type=search]').val('').hide();
			filemanager.find('span').show();
		}
		else {
			breadcrumbsUrls.push(nextDir);
		}

		window.location.hash = encodeURIComponent(nextDir);
		currentPath = nextDir;
	});


	// Clicking on breadcrumbs

	breadcrumbs.on('click', 'a', function(e){
		e.preventDefault();

		var index = breadcrumbs.find('a').index($(this)),
			nextDir = breadcrumbsUrls[index];

		breadcrumbsUrls.length = Number(index);

		window.location.hash = encodeURIComponent(nextDir);

	});


	// Navigates to the given hash (path)

	function goto(hash) {

		hash = decodeURIComponent(hash).slice(1).split('=');
		if (hash.length) {
			var rendered = '';

			// if hash has search in it

			if (hash[0] === 'search') {

				filemanager.addClass('searching');
				rendered = searchData(response, hash[1].toLowerCase());

				if (rendered.length) {
					currentPath = hash[0];
					render(rendered);
				}
				else {
					render(rendered);
				}

			}

			// if hash is some path

			else if (hash[0].trim().length) {
				var hashForOrder = hash[0]+'?orderby='+orderType+"&nb="+nbrContent+"&p"+currentPage;
				searchByPathAjax(hashForOrder).done(function(dataList){
					rendered = dataList;

					if (Object.keys(rendered).length) {

						currentPath = hash[0];
						breadcrumbsUrls = generateBreadcrumbs(hash[0]);
						render(rendered);

					}
					else {
						currentPath = hash[0];
						breadcrumbsUrls = generateBreadcrumbs(hash[0]);
						render(rendered);
					}
				});
			}

			// if there is no hash

			else {
				$.get(window.MVDB_Server+'/scan/'+window.root_dir, function(data) {
					currentPath = data.Path;
					breadcrumbsUrls.push(data.Path);
					render(data.Items);

				});
			}
		}
	}

	// Splits a file path and turns it into clickable breadcrumbs

	function generateBreadcrumbs(nextDir){
		window.actual_dir = nextDir;
		var path = nextDir.split('/').slice(0);
		for(var i=1;i<path.length;i++){
			path[i] = path[i-1]+ '/' +path[i];
		}
		return path;
	}

	function orderFile(){
		alert('order !!');
	}

	// Locates a file by path
	function searchByPath(dir){
		var path = dir.Path.split('/'),
			demo = [dir],
			flag = 0;

		/*for(var i=0;i<path.length;i++){
			for(var j=0;j<demo.length;j++){
				if(demo[j].Name === path[i]){
					flag = 1;
					demo = demo[j].Items;
					break;
				}
			}
		}*/

		demo = demo[0].Items;
		//demo = flag ? demo : [];
		return demo;
	}

	function searchByPathAjax(dir) {
		var dfd = $.Deferred();
		var path = dir.split('/'),
		demo = [],
			flag = 0;

		//get json - response from scan
		$.get(window.MVDB_Server+'/scan/'+dir, function(data) {
			contentList = [data];
			demo = contentList[0].Items;

			nbPageTot = data.NBPages;
			if(nbPageTot <= 1){
				$('.paginatioN').addClass('invisible');
			}else{
				$('.paginatioN').removeClass('invisible');
				$('.nbPageMx').html('/ '+nbPageTot)
				$('.currentPage').val(data.DisplayedPage)
			}

			//getSuperPagination(nbPageTot, data.DisplayedPage)

			dfd.resolve(demo);
		});

		return dfd.promise();


	}



	// Recursively search through the file tree

	function searchData(data, searchTerms) {
		data.forEach(function(d){
			if(d.type === 'folder') {

				searchData(d.items,searchTerms);

				if(d.name.toLowerCase().match(searchTerms)) {
					folders.push(d);
				}
			}
			else if(d.type === 'file') {
				if(d.name.toLowerCase().match(searchTerms)) {
					files.push(d);
				}
			}
		});
		return {folders: folders, files: files};
	}


	// Render the HTML for the file manager

	function render(data) {

		var scannedFolders = [],
			scannedFiles = [];

		//if(Array.isArray(data)) {
			//data.forEach(function (d) {
			for(current in data){
				d = data[current];

				if (d.Type === 'folder') {
					scannedFolders.push(d);
				}
				else if (d.Type === 'file') {
					scannedFiles.push(d);
				}

			};

	//	}
		/*else if(typeof data === 'object') {
			scannedFolders = data.Folders;
			scannedFiles = data.Files;

		}*/

		// Empty the old result and make the new one

		fileList.empty().hide();

		if(!scannedFolders.length && !scannedFiles.length) {
			filemanager.find('.nothingfound').show();
		}
		else {
			filemanager.find('.nothingfound').hide();
		}

		if(scannedFolders.length) {

			scannedFolders.forEach(function(f) {
				var itemsLength = f.NBItems,
					name = escapeHTML(f.Name),
					icon = '<span class="icon folder"></span>';

				if(itemsLength) {
					icon = '<span class="icon folder full"></span>';
				}

				if(itemsLength == 1) {
					itemsLength += ' item';
				}
				else if(itemsLength > 1) {
					itemsLength += ' items';
				}
				else {
					itemsLength = 'Empty';
				}

				//var folder = $('<li class="folders"><a href="'+ f.Path +'" title="'+ f.Path +'" class="folders">'+icon+'<span class="name">' + name + '</span> <span class="details">' + itemsLength + '</span></a></li>');
				var folder = $('<div class="col-md-4"><div class="col-md-12 medias folders"><a href="'+ f.Path +'" title="'+ f.Path +'" class="folders"><div class="row"><div class="col-md-4">'+icon+'</div><div class="col-md-8"><div class="name">' + name + '</div> <div class="details">' + itemsLength + '</div></div></div></a></div></div>');
				folder.appendTo(fileList);
			});

		}

			if(scannedFiles.length) {

				scannedFiles.forEach(function(f) {
					icon = '<div class="col-md-5"><img class="icon file" src="'+f.ArtworkUrl+'" width="100%" /></div>';

					//var file = $('<li class="files opener" tmdbid="'+f.TMDBID+'" media="'+f.Path+'">' //'<a href="'+ f.path+'" title="'+ f.path +'" class="files opener">'
					//var folder = $('<div class="col-md-4"><div class="col-md-12 medias files opener"><a href="'+ f.Path +'" title="'+ f.Path +'" class="folders"><div class="row"><div class="col-md-4">'+icon+'</div><div class="col-md-8"><div class="name">' + name + '</div> <div class="details">' + itemsLength + '</div></div></div></a></div></div>');

					var file = $('<div class="col-md-4"><div class="col-md-12 medias files opener" tmdbid="'+f.TMDBID+'" media="'+f.Path+'"><div class="row">'
						+ icon
						+ '<div class="col-md-7"><span class="infos">'
						+ '<span class="title">' + f.Name + '</span><br/>'
						+ '<span class="year">' + f.Year + '</span><br/>'
						+ '<span class="qualite">' + f.Origine + ' - ' + f.Qualite + '</span><br/>'
						+ '<span class="qualite">' + f.Langues + '</span><br/>'
						+ '<span class="filetype">' + f.Ext.toUpperCase()+ '</span> <span class="filesize">(' + bytesToSize(f.Size) + ')</span><br/>'
						+'</div></div></div></div>');
					file.appendTo(fileList);
				});
				$( ".opener" ).click(function() {
					mediaID = $(this).attr("tmdbid");
					mediaName = $(this).find(".title").html();
					mediaYear = $(this).find(".year").html();
					mediaDownload = $(this).attr("media");
					$.get(window.MVDB_Server+'/infos/'+mediaID, function(data) {
						var tmp = "";
						data.Genres.forEach(function(elmt) {
							tmp = tmp +" "+elmt.Name;
						});
						$(".mediaDetails .year").html(data.production_companies[0].Name+" ("+data.release_date+")");
						$(".mediaDetails .genre").html(tmp);
						$(".mediaDetails .orginalname").html(data.original_title);
						$(".mediaDetails .synopsy").html(data.Overview);
					});
					details = '<span class="mediaDetails">'
						+ '<img class="poster" src="'+window.MVDB_Server+'/art/'+mediaID+'/'+window.cover_size+'" width="342px" />'
						+ '<span class="infos">'
						+ '<span class="name">' + mediaName + '</span><br/>'
						+ '<span class="orginalname"></span><br/>'
						+ '<span class="year"></span><br/><br/>'
						+ '<span class="genre"></span><br/><br/>'
						+ '<span class="synopsy"></span><br/><br/><br/>'
						+ '<a class="download" href="'+mediaDownload+'">Download</a><br/>'
						+ '</span>';
						+ '</span>';
					$( "#dialog" ).html(details);
					$( "#dialog" ).dialog( "open" );
				});

		}


		// Generate the breadcrumbs

		var url = '';

		if(filemanager.hasClass('searching')){

			url = '<span>Search results: </span>';
			fileList.removeClass('animated');

		}
		else {

			fileList.addClass('animated');
			url+='<ol class="breadcrumb">';
			breadcrumbsUrls.forEach(function (u, i) {
				var name = u.split('/');

				if (i !== breadcrumbsUrls.length - 1) {
					//url += '<a href="'+u+'"><span class="folderName">' + name[name.length-1] + '</span></a> <span class="arrow">→</span> ';
					url += '<li class="breadcrumb-item"><a href="'+u+'"><span class="folderName">' + name[name.length-1] + '</span></a></li>';//'<a href="'+u+'"><span class="folderName">' + name[name.length-1] + '</span></a> <span class="arrow">→</span> ';
				}
				else {
					//url += '<span class="folderName">' + name[name.length-1] + '</span>';
					url += '<li class="breadcrumb-item active"><span class="folderName">' + name[name.length-1] + '</span></li>';
				}

			});
			url+='</ol>';
		}
		breadcrumbs.text('').append(url);
//use contentList
		//var toto = {NBPages:5, DisplayedPage:4};
		getSuperPagination(contentList[0].NBPages, contentList[0].DisplayedPage);

		// Show the generated elements

		// fileList.animate({'display':'inline-block'});
		// fileList.animate({
		// 	display: true
		// }, "fast");
		fileList.fadeIn();

	}
	function addHtmlPage(value, active = false, disabled = false, other = []){

		var resultHTML = '<li class="page-item';

		if(active)
			resultHTML += ' active';
		if(disabled)
			resultHTML+=' disabled';

		resultHTML+='"><a class="page-link" href="#" tabindex="-1"';

		other.forEach(function(value){
			resultHTML+=' '+value;
		});

		resultHTML+= '>'+value+'</a></li>';

		return resultHTML;
	}

	function getSuperPagination(nbPage, current){
		var maxPageInRow = 4;

		var html = addHtmlPage('Previous', false, current == 1, ['prev']);//'<li class="page-item disabled"><a class="page-link" href="#" tabindex="-1" prev>Previous</a></li>';

		if(nbPage<=maxPageInRow){
			for (var pp = 1; pp <= maxPageInRow; pp++) {
				html += addHtmlPage(pp, pp == current);//'<li class="page-item"><a class="page-link" href="#">'+pp+'</a></li>';
			}
		}else{
			if(current<maxPageInRow){
				for (var pp = 1; pp <= maxPageInRow; pp++) {
					html += addHtmlPage(pp, pp == current);//'<li class="page-item"><a class="page-link" href="#">'+pp+'</a></li>';
				}
				if(nbPage != maxPageInRow+1){
				html += addHtmlPage('...', false, true);//'<li class="page-item disabled"><a class="page-link" href="#">...</a></li>';
				}
				html += addHtmlPage(nbPage);//'<li class="page-item"><a class="page-link" href="#">'+nbPage+'</a></li>';
			}else{
				html += addHtmlPage('1');//'<li class="page-item"><a class="page-link" href="#">1</a></li>';
				html += addHtmlPage('...', false, true);//'<li class="page-item disabled"><a class="page-link" href="#">...</a></li>';

				var maxPage = (current+1 > nbPage) ? nbPage : current+1;
				for (var pp = current-1; pp <= maxPage; pp++) {
					html += addHtmlPage(pp, pp == current);//'<li class="page-item"><a class="page-link" href="#">'+pp+'</a></li>';
				}

				if(nbPage - current >= maxPageInRow-1){
					html += addHtmlPage('...', false,true);//'<li class="page-item disabled"><a class="page-link" href="#">...</a></li>';
				}

				if(current+1 < nbPage){
					html += addHtmlPage(nbPage);//'<li class="page-item"><a class="page-link" href="#">'+nbPage+'</a></li>';
				}
			}
		}

		html += addHtmlPage('Next', false, current == nbPage, ['next']);

		$('.pagination').html(html);


	}

	// This function escapes special html characters in names

	function escapeHTML(text) {
		return text.replace(/\&/g,'&amp;').replace(/\</g,'&lt;').replace(/\>/g,'&gt;');
	}


	// Convert file sizes from bytes to human readable units

	function bytesToSize(bytes) {
		var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		if (bytes == 0) return '0 Bytes';
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
	}

});
