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

	// Custom tags validation
	$('#sgpm-custom-allowed-tags, #sgpm-custom-allowed-attrs').on('input', function() {
		var $this = $(this);
		var value = $this.val();
		var isValid = true;
		var errorMessage = '';

		// Clean and validate tags/attributes
		if (value.trim() !== '') {
			var items = value.split(',').map(function(item) {
				return item.trim();
			});

			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				if (item !== '') {
					// Check that the element starts with a letter and contains only valid characters
					if (!/^[a-zA-Z][a-zA-Z0-9\-_]*$/.test(item)) {
						isValid = false;
						errorMessage = 'Tags/attributes must start with a letter and contain only letters, numbers, dashes and underscores.';
						break;
					}
				}
			}
		}

		// Show/hide errors
		$this.removeClass('sgpm-error');
		$this.next('.sgpm-validation-error').remove();

		if (!isValid) {
			$this.addClass('sgpm-error');
			$this.after('<div class="sgpm-validation-error" style="color: #d63638; font-size: 12px; margin-top: 5px;">' + errorMessage + '</div>');
		}
	});

	// Form validation before submission
	$('#sgpm-form-general-settings-save').on('submit', function(e) {
		var isValid = true;
		var $tagsField = $('#sgpm-custom-allowed-tags');
		var $attrsField = $('#sgpm-custom-allowed-attrs');

		// Validate tags
		if ($tagsField.val().trim() !== '') {
			var tags = $tagsField.val().split(',').map(function(item) {
				return item.trim();
			});

			for (var i = 0; i < tags.length; i++) {
				var tag = tags[i];
				if (tag !== '' && !/^[a-zA-Z][a-zA-Z0-9\-_]*$/.test(tag)) {
					isValid = false;
					$tagsField.addClass('sgpm-error');
					break;
				}
			}
		}

		// Validate attributes
		if ($attrsField.val().trim() !== '') {
			var attrs = $attrsField.val().split(',').map(function(item) {
				return item.trim();
			});

			for (var i = 0; i < attrs.length; i++) {
				var attr = attrs[i];
				if (attr !== '' && !/^[a-zA-Z][a-zA-Z0-9\-_:]*$/.test(attr)) {
					isValid = false;
					$attrsField.addClass('sgpm-error');
					break;
				}
			}
		}

		if (!isValid) {
			e.preventDefault();
			alert('Please correct validation errors before saving.');
		}
	});
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
