<?php

class SGPMNotificationEngine
{
	private static $instance = null;

	const ACTIVE_NOTIFICATION = 1;

	private $activeNotificationsCount = 0;
	private $activeNotifications = array();
	private $dismissedNotifications = array();
	private $statusDisabled = '0';

	private $reviewNotice = array(
		'hash' => false,
		'status' => true,
		'type' => 'review',
		'title' => 'Leave a Review',
		'text' => 'Popup Maker team is happy you are using our popups for a while and we hope our plugin helps you to improve the conversion of your website. We’d be very thankful and inspired if you can support us and have your input with your positive feedback.',
		'links' => array(
			array(
				'className' => 'sgpm-review',
				'label' => 'Leave a Review Here!',
				'url' => 'https://wordpress.org/support/plugin/popup-maker-wp/reviews/#new-post'
			)
		)
	);

	private $notificationBellIconSvg = '<svg class="sgpm-notification-bell-icon sgpm-bell-ring-animation" height="10pt" viewBox="-21 0 512 512" width="10pt" xmlns="http://www.w3.org/2000/svg"><path d="m448 232.148438c-11.777344 0-21.332031-9.554688-21.332031-21.332032 0-59.839844-23.296875-116.074218-65.601563-158.402344-8.339844-8.339843-8.339844-21.820312 0-30.164062 8.339844-8.339844 21.824219-8.339844 30.164063 0 50.371093 50.367188 78.101562 117.335938 78.101562 188.566406 0 11.777344-9.554687 21.332032-21.332031 21.332032zm0 0"/><path d="m21.332031 232.148438c-11.773437 0-21.332031-9.554688-21.332031-21.332032 0-71.230468 27.734375-138.199218 78.101562-188.566406 8.339844-8.339844 21.824219-8.339844 30.164063 0 8.34375 8.34375 8.34375 21.824219 0 30.164062-42.304687 42.304688-65.597656 98.5625-65.597656 158.402344 0 11.777344-9.558594 21.332032-21.335938 21.332032zm0 0"/><path d="m434.753906 360.8125c-32.257812-27.265625-50.753906-67.117188-50.753906-109.335938v-59.476562c0-75.070312-55.765625-137.214844-128-147.625v-23.042969c0-11.796875-9.558594-21.332031-21.332031-21.332031-11.777344 0-21.335938 9.535156-21.335938 21.332031v23.042969c-72.253906 10.410156-128 72.554688-128 147.625v59.476562c0 42.21875-18.496093 82.070313-50.941406 109.503907-8.300781 7.105469-13.058594 17.429687-13.058594 28.351562 0 20.589844 16.746094 37.335938 37.335938 37.335938h352c20.585937 0 37.332031-16.746094 37.332031-37.335938 0-10.921875-4.757812-21.246093-13.246094-28.519531zm0 0"/><path d="m234.667969 512c38.632812 0 70.953125-27.542969 78.378906-64h-156.757813c7.421876 36.457031 39.742188 64 78.378907 64zm0 0"/></svg>';

	private $clearAllIconSvg = '<svg class="sgpm-clear-all-notifications" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" height="16pt" width="16pt" viewBox="0 0 384 384" style="enable-background:new 0 0 384 384;" xml:space="preserve"><g><g><g><rect x="42.667" y="170.667" width="298.667" height="42.667"/><rect x="0" y="256" width="298.667" height="42.667"/><rect x="85.333" y="85.333" width="298.667" height="42.667"/></g></g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>';

	private $closeNotifictionIconSvg = '<svg class="sgpm-close-notifications" enable-background="new 0 0 386.667 386.667" height="10pt" viewBox="0 0 386.667 386.667" width="10pt" xmlns="http://www.w3.org/2000/svg"><path d="m386.667 45.564-45.564-45.564-147.77 147.769-147.769-147.769-45.564 45.564 147.769 147.769-147.769 147.77 45.564 45.564 147.769-147.769 147.769 147.769 45.564-45.564-147.768-147.77z"/></svg>';

	public static function getInstance()
	{
		if (self::$instance === null) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	private function __construct()
	{
		$this->init();
	}

	private function init()
	{
		$this->addCustomCronSchedule();
		$this->validateNotificationEngineOptions();

		$notificationsSource = get_option('sgpm_popup_maker_notification_engine_source');
		$notificationsSource = maybe_unserialize($notificationsSource);
		$dismissedNotifications = get_option('sgpm_popup_maker_dismissed_notifacions');
		$dismissedNotifications = !is_array($dismissedNotifications) ? array() : json_decode($dismissedNotifications);

		$this->setActiveNotificationsCount($notificationsSource);
		$this->activeNotifications = $notificationsSource;
		$this->dismissedNotifications = $dismissedNotifications;
	}

	private function setActiveNotificationsCount($notificationsSource)
	{
		if ($notificationsSource && is_array($notificationsSource) && !empty($notificationsSource)) {
			foreach ($notificationsSource as $notification) {
				if ($notification['status'] == $this->statusDisabled) continue;
				$this->activeNotificationsCount++;
			}
		}
	}

	private function validateNotificationEngineOptions()
	{
		$storedNotificationSource = get_option('sgpm_popup_maker_notification_engine_source');

		if (!$storedNotificationSource) {
			add_option('sgpm_popup_maker_notification_engine_source', maybe_serialize(array()));
			add_option('sgpm_popup_maker_dismissed_notifacions', json_encode(array()));
		}
	}

	private function addCustomCronSchedule()
	{
		/* temprory fix : Delete old crons */
		wp_clear_scheduled_hook("sgpm_fetch_new_notifications");
		wp_unschedule_event(time(), 'sgpm_check_for_new_notifications_every_6_hours');

		//add_action('sgpm_fetch_notifications', array($this, 'fetchNewNotifications'));
		//add_filter('cron_schedules', array($this, 'checkeForNewNotificationsCron')); // add new schedule

		if (!wp_next_scheduled('sgpm_fetch_notifications')) {
			//wp_schedule_event(time(), 'twicedaily', 'sgpm_fetch_notifications');
		}
	}

	public function checkeForNewNotificationsCron($schedules)
	{
		$schedules['sgpm_check_for_new_notifications_every_6_hours'] = array(
			'interval' => 60*60*6, // Every 6 hours (in seconds)
			'display'  => __('Popup Maker every 6 hours'),
		);

		return $schedules;
	}

	public function fetchNewNotifications()
	{
		$newNotifications = array();
		$existingNotificationsSource = maybe_unserialize(get_option('sgpm_popup_maker_notification_engine_source'));
		$dismissedNotifacions = json_decode(get_option('sgpm_popup_maker_dismissed_notifacions'), true);
		$isValidExistingNotificationsSource = $this->validateExistingNotificationsSource($existingNotificationsSource);

		if (!$isValidExistingNotificationsSource) {
			update_option('sgpm_popup_maker_notification_engine_source', maybe_serialize(array()));
		}

		if (!is_array($dismissedNotifacions)) {
			update_option('sgpm_popup_maker_dismissed_notifacions', json_encode(array()));
			$dismissedNotifacions = array();
		}

		$response = wp_remote_get(SGPM_NOTIFICATIONS_API_URL);
		$body = wp_remote_retrieve_body($response);

		if (is_wp_error($response)) {
			// wp_die("Something went wrong after fetching notifiactions!");
			return;
		}

		$notificationsSource = json_decode($body, true);
		$validBody = SGPMBase::validateNotificationsBody($notificationsSource);

		if (isset($notificationsSource) && $validBody) {
			foreach ($notificationsSource as $notification) {
				$hash = $notification['hash'];
				$status = $notification['status'];

				if (in_array($hash, $dismissedNotifacions)) continue;

				foreach ($existingNotificationsSource as $existingNotification) {
					$existingHash = $existingNotification['hash'];
					$existingStatus = $existingNotification['status'];

					if ($existingHash == $hash && $existingStatus != $status) {
						$existingNotification['status'] = $status;
						$notification = $existingNotification; // update notification
					}
				}

				array_push($newNotifications, $notification);
			}

			update_option('sgpm_popup_maker_notification_engine_source', maybe_serialize($newNotifications));
		}
	}

	private function validateExistingNotificationsSource($existingNotificationsSource)
	{
		$serializedData = maybe_unserialize($existingNotificationsSource);

		if (is_serialized($serializedData)) {
			return true;
		}
		else {
			return false;
		}
	}

	public function clearAllNotifications()
	{
		$hashArray = array();
		$notificationsSource = maybe_unserialize(get_option('sgpm_popup_maker_notification_engine_source'));
		$dismissedNotifications = json_decode(get_option('sgpm_popup_maker_dismissed_notifacions'), true);

		foreach ($notificationsSource as $notification) {
			if (in_array($notification['hash'], $dismissedNotifications)) continue;
			array_push($dismissedNotifications, $notification['hash']);
		}

		update_option('sgpm_popup_maker_notification_engine_source', maybe_serialize(array()));
		update_option('sgpm_popup_maker_dismissed_notifacions', json_encode($dismissedNotifications));
	}

	public function removeNotification($hash, $notificationId)
	{
		if (isset($this->activeNotifications[$notificationId])) {
			unset($this->activeNotifications[$notificationId]);
			update_option('sgpm_popup_maker_notification_engine_source', maybe_serialize($this->activeNotifications));

			array_push($this->dismissedNotifications, $hash);
			update_option('sgpm_popup_maker_dismissed_notifacions', json_encode($this->dismissedNotifications));
		}
	}

	public function setNotificationBadgeData()
	{
		$showReviewNotice = $this->allowedToShowReviewNotice();
		if ($showReviewNotice) $this->activeNotificationsCount += 1;

		if ($this->activeNotificationsCount) {
			ob_start();
			?>
			<script>
			jQuery(document).ready(function() {
			jQuery('.sgpm-menu-item-notification-badge').remove();
			jQuery('#toplevel_page_popup-maker-api-settings > .toplevel_page_popup-maker-api-settings > .wp-menu-name').append('<span class="sgpm-menu-item-notification-badge"><?php echo esc_html($this->activeNotificationsCount)?></span>');
			})
			</script>
			<?php
			$badge = ob_get_contents();
			ob_end_clean();
		}
	}

	public function create()
	{
		$this->validateNotificationEngineOptions();
		$innerHtml = $this->getNotificationBody();
		if ($innerHtml) {
			$this->getNotificationShadeWrapper($innerHtml);
		}
	}

	private function allowedToShowReviewNotice()
	{
		$showReviewNotice = true;
		$pastDate = strtotime('-30 days');

		$activationDate = get_option('sgpm_popup_maker_activation_date');
		$noticeDismissed = get_option('sgpm_popup_maker_dismiss_review_notice');

		if ($noticeDismissed == 'true') {
			$showReviewNotice = false;
		}
		else if (!current_user_can('install_plugins')) {
			$showReviewNotice = false;
		}
		else if (!$activationDate || $activationDate > $pastDate) {
			$showReviewNotice = false;
		}

		return $showReviewNotice;
	}

	private function getNotificationShadeWrapper($innerHtml)
	{
		$wrapper = '<div class="sgpm-notification-shade-wrapper">';
		$wrapper .= '<div class="sgpm-notification-shade-header">';
		$wrapper .= '<h3 class="sgpm-notification-shade-title"><span><span><div class="sgpm-bell-icon-container">'.$this->notificationBellIconSvg.'</div>&nbsp;Notifications (<span class="sgpm-notifications-count">'.$this->activeNotificationsCount.'</span>)</span></h3>';
		$wrapper .= '<h3 class="sgpm-notification-shade-buttons">';
		$wrapper .= '<span class="sgpm-collapce-all sgpm-action-icon-container" onclick="clearAllNotifications()">';
		$wrapper .= $this->clearAllIconSvg;
		$wrapper .= '</span>';
		$wrapper .= '</h3>';
		$wrapper .= '</div>';
		$wrapper .= '<div class="sgpm-notifications-container">';
		$wrapper .= $innerHtml;
		$wrapper .= '</div>';
		$wrapper .= '</div>';

		return $wrapper;
	}

	private function getNotificationBody()
	{
		$body = '';
		$showReviewNotice = $this->allowedToShowReviewNotice();
		if ($showReviewNotice && is_array($this->activeNotifications)) {
			array_push($this->activeNotifications, $this->reviewNotice);
			(int)$this->activeNotificationsCount = count($this->activeNotifications);
		}
		if (empty($this->activeNotifications)) return false;

		foreach ($this->activeNotifications as $id => $notification) {
			// dismiss disabled notifications
			if ($notification['status'] == $this->statusDisabled) continue;

			$body .= '<div class="sgpm-notification-body sgpm-notification-'.$id.'">';
			$body .= '<div class="sgpm-notification-header">';
			$body .= '<h3 class="sgpm-notification-title">';
			$body .= '<span>'.$notification['title'].'</span>';
			$body .= '</h3>';

			$body .= '<h3 class="sgpm-notification-buttons">';
			$body .= '<span class="sgpm-collapce sgpm-action-icon-container" onclick="removeNotification(\''.$notification['hash'].'\',\''.$notification['type'].'\','.$id.')">';
			$body .= $this->closeNotifictionIconSvg;
			$body .= '</span>';
			$body .= '</h3>';
			$body .= '</div>';

			$body .= '<div class="sgpm-notification-text">';
			$body .= $notification['text'];
			$body .= '</div>';

			$body .= '<div class="sgpm-notification-footer">';
			foreach ($notification['links'] as $link) {
				$body .= '<a class="sgpm-info-link '.$link['className'].'" target="_blank" href="'.$link['url'].'">'.$link['label'].'</a>';
			}
			$body .= '</div>';

			$body .= '</div>';
		}

		return $body;
	}
}
