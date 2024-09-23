jQuery(document).ready(function($)
{
	var sgpmOptionsPanel = new SGPMOptionsPanel();
	sgpmOptionsPanel.init();

	$('.sgpm-tab-container').pwstabs({
		effect: 'slideleft',
		defaultTab: 1,
		containerWidth: '1000px',
		tabsPosition: 'vertical',
		verticalPosition: 'left'
	});

	jQuery('.refresh-popup-data-btn').on('click', function(event) {
		jQuery('#sgpm-form-api').submit();
	});

	sgpmAddSelectBoxValuesIntoInput();

	jQuery('.sgpm-enable-disable-switch-button').sgpm_lc_switch();

	jQuery('body').delegate('.sgpm-enable-disable-switch-button', 'sgpm_lcs-statuschange', function() {

		var status = (jQuery(this).is(':checked')) ? 'enabled' : 'disabled';
		var popupId = jQuery(this).attr('data-popup-id');

		jQuery('#ajax-loader-'+popupId).show();
		jQuery(this).next('.sgpm_lcs_switch').addClass('sgpm_lcs_disabled');
		sgpmChangePopupStatus(popupId, status);
	});


	$('.sgpm-select-user-roles-multiple').select2();
});

function clearAllNotifications()
{
	var sgpmNotifications = jQuery('.sgpm-notification-body');
	jQuery(sgpmNotifications[0]).addClass('sgpm-animation-slide-right');


	var animationTimout = setTimeout(function() {
		jQuery(sgpmNotifications[0]).remove();
		clearAllNotifications();
	}, 350);


	if (!sgpmNotifications.length) {
		clearTimeout(animationTimout);
		sgpmRemoveNotificationShade();

		var data = {
			action: 'sgpm_clear_all_notifications',
		};

		jQuery.post(ajaxurl, data);
	}
}

function removeNotification(hash, type, id)
{
	var notificationsCount = jQuery('.sgpm-notification-body').length - 1;

	jQuery('.sgpm-notification-' + id).addClass('sgpm-animation-slide-right');
	setTimeout(function() { jQuery('.sgpm-notification-' + id).remove(); }, 400);

	jQuery('.sgpm-notifications-count').html(notificationsCount);
	jQuery('.sgpm-menu-item-notification-badge').html(notificationsCount);

	if (!notificationsCount) sgpmRemoveNotificationShade();

	var data = {
		action: 'sgpm_remove_notification',
		hash: hash,
		notificationId: id,
		notificationType: type
	};

	jQuery.post(ajaxurl, data);
}

function sgpmRemoveNotificationShade()
{
	jQuery('.sgpm-menu-item-notification-badge').remove();
	jQuery('.sgpm-notification-shade-wrapper').slideUp(450);

	setTimeout(function() {
		jQuery('.sgpm-notification-shade-wrapper').remove();
	}, 500);
}

function sgpmChangePopupStatus(popupId, popupStatus)
{
	var data = {
		action: 'sgpm_change_popup_status',
		_ajax_nonce: SGPM_JS_PARAMS.nonce,
		popupId: popupId,
		popupStatus: popupStatus
	};

	jQuery.post(ajaxurl, data, function(response,d) {
		jQuery('.sgpm_lcs_switch').removeClass('sgpm_lcs_disabled');
	}).done(function() {
		jQuery('[data-sgpm-popup-id='+popupId+'] .sgpm-popup-status').removeClass('sgpm-popup-enabled sgpm-popup-disabled').addClass('sgpm-popup-'+popupStatus);
		jQuery('[data-sgpm-popup-id='+popupId+'] .sgpm-popup-status').text(popupStatus);
		jQuery('#ajax-loader-'+popupId).hide();
	})
	.fail(function() {
		alert( "Error! Your change can not be done." );
		jQuery('#ajax-loader-'+popupId).hide();
	});
	
}

function sgpmAddSelectBoxValuesIntoInput()
{
	var selectedPages = [];
	var selectedPosts = [];

	jQuery("#sgpm-form-options-save").submit(function(e) {
		var pages = jQuery("select[data-selectbox='sgpmSelectedPages'] > option:selected");
		var posts = jQuery("select[data-selectbox='sgpmSelectedPosts'] > option:selected");

		for(var i=0; i<pages.length; i++) {
			selectedPages.push(pages[i].value);
		}
		for(var i=0; i<posts.length; i++) {
			selectedPosts.push(posts[i].value);
		}

		jQuery(".sgpm-selected-pages").val(selectedPages);
		jQuery(".sgpm-selected-posts").val(selectedPosts);
	});
}

function sgpmToggle(className, inputValue)
{
	jQuery('.'+className).toggle(inputValue);
}
