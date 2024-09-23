window.SGPMPopupLoader=window.SGPMPopupLoader||{ids:[],popups:{},call:function(w,d,s,l,id){
	w['sgp']=w['sgp']||function(){(w['sgp'].q=w['sgp'].q||[]).push(arguments[0]);};
	var sg1=d.createElement(s),sg0=d.getElementsByTagName(s)[0];
	if(SGPMPopupLoader && SGPMPopupLoader.ids && SGPMPopupLoader.ids.length > 0){SGPMPopupLoader.ids.push(id); return;}
	SGPMPopupLoader.ids.push(id);
	sg1.onload = function(){SGPMPopup.openSGPMPopup();}; sg1.async=true; sg1.src=l;
	sg0.parentNode.insertBefore(sg1,sg0);
	return {};
}};

if (typeof sgpmPopupHashIds != 'undefined') {
	for (var i = sgpmPopupHashIds.length - 1; i >= 0; i--) {
		SGPMPopupLoader.call(window,document,'script', SGPM_ASSETS_URL + 'js/SGPMPopup.js', sgpmPopupHashIds[i]);
	}
}
