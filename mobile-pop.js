(function(){
	var win = window;
	var doc = document;
	var mpGroup = function(el){
		this.popups = new Array();
		this.id = '';
	};
	var parents = function(child, parent){
		if(child.parentNode == parent) return parent;
		else if (child.parentNode == doc.body) return false;
		else return parents(child.parentNode, parent);
	};
	var ytidRequest = new XMLHttpRequest();
	ytidRequest.onreadystatechange = function(){
		return  (ytidRequest.readyState==4 && ytidRequest.status==200);
	}
	function popup(link, container){
		var self = this;
		this.link = link;
		this.container = container;
		this.inline = link.className.indexOf('mobile-pop-inline') > -1  ? true: false;
		this.youtube = link.className.indexOf('mobile-pop-youtube') > -1  ? true: false;
		this.pos = 0;
		var pos = 0;
		if(this.inline){
			href = this.link.href;
			this.id =  href.substring(href.indexOf('#') + 1, href.length);
		}
		this.onReady = function(){

		};
		this.open = function(){
			var body = doc.body;
			var html = doc.documentElement;
			var box = doc.getElementById('mp-box');
			this.container.style.display = 'block';
			this.pos = body.scrollTop > 0  ? body.scrollTop: html.scrollTop;
			var self = this;
			var content = doc.getElementById('mp-content');
			if(this.inline){
				var popup = doc.getElementById(this.id);
				if(this.youtube){
					//most of this is for autoplaying
					var video = popup.getElementsByTagName('iframe')[0];
					var src = video.src;
					var split = video.src.split("?");
					src = split.length > 1 ? split[0] + '?autoplay=1&' + split[1]: video.src + 'autoplay=1';
					var x = doc.getElementById('mp-close');
					box.className +=' mp-youtube-box';
					x.className += ' mp-x-above';  //TODO possibly move element into box for videos
				}
				content.innerHTML = popup.innerHTML;
				//if(this.youtube == true) content.getElementsByTagName('iframe')[0].src = src; //add in autoplaying youtube url doesnt work on mobile
			}
			else if(this.youtube){ //non inline youtube video for huge load time increase
				//alows for inputing youtube videos just by id in the format: ytid:[youtbe video id][youtube video get var string]
				var ytid = link.href.split(/[\:\?]/);
				ytidRequest.open("GET","//gdata.youtube.com/feeds/api/videos/" + ytid[1], false);
				ytidRequest.send();
				if(ytidRequest.onreadystatechange()){
					box.className +=' mp-youtube-box';
					var wrapper = doc.createElement('div');
					wrapper.className = 'mp-youtube-wrapper';
					var ytFrame = doc.createElement('iframe');
					ytFrame.setAttribute('frameborder', 0);
					ytFrame.setAttribute('allowfullscreen', true);
					ytFrame.src = '//www.youtube.com/embed/' + ytid[1] + '?' + ytid[2];
					wrapper.appendChild(ytFrame);
					content.innerHTML = '';
					content.appendChild(wrapper);
				}
			}
			var close = doc.getElementsByClassName('mp-close-pop');
			for(var i = 0; i < close.length; i++){
				close[i].onclick = function(){
					self.close();
				};
				box.addEventListener('touchstart', function(e){
					e.stopPropagation();
				}, false);
				close[i].addEventListener('touchstart', function(e){
					if(e.target.id != "mp-box")
					self.close();
				}, false);
			}
			this.onReady();
		return this;
		}
		this.close = function(){
			var self = this;
			win.scrollTo(0, this.pos);
			this.container.style.display = 'none';
			content = doc.getElementById('mp-content');
			content.innerHTML = '';
			content.style.height = '';
			doc.getElementById('mp-close').className = 'mp-close-pop';
			doc.getElementById('mp-box').className = '';
			doc.documentElement.style.overflow = '';
			doc.body.style.overflow = '';
		}
	};
	
	mobilePop = {
		/*getGroupPops: function(el){
			var group = new mpGroup();
			group.id = link.id;
			return group;
		},*/ //todo build out grouping functionality
		popups: new Array(),
		buildPop: function(){
			var container  = doc.createElement('div');
			container.id = 'mp-container';
			var box = doc.createElement('div');
			box.id = 'mp-box';
			var bg = doc.createElement('div');
			bg.id  = 'mp-bg';
			bg.className = 'mp-close-pop';
			var content = doc.createElement('div');
			content.id = 'mp-content';
			var x = doc.createElement('span');
			x.id = 'mp-close';
			x.className = 'mp-close-pop';
			x.innerHTML = '+';
			doc.body.insertBefore(container, doc.body.firstChild);
			container.appendChild(x);
			box.appendChild(content);
			container.insertBefore(box, container.firstChild);			
			container.insertBefore(bg, box);
			return container;
		},
		getPop: function(id){
			for(var i = 0; i < this.popups.length; i++){
				if(this.popups[i].id == id) return this.popups[i];
			}
			return false;
		},
		init: function(){
 			var container = this.buildPop();
 			var popEls = document.getElementsByClassName('mobile-pop-link');
 			var pops = new Array();
 			for(var i = 0; i < popEls.length; i++){
				pops[i] = new popup(popEls[i], container);
 				(function(pop){
	 				pop.link.onclick = function(e){
	 					e.preventDefault();
						pop.open();
						return false;
					};
				})(pops[i]); //weird scoping issue
  			}
  			this.popups = pops;
		}
	};
})();
mobilePop.init();