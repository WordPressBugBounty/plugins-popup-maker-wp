<?php

class SGPMBase
{
	/**
	 * Holds the class object.
	 *
	 * @since 1.0.0
	 *
	 * @var object
	 */
	public static $instance;

	/**
	 * Plugin version, used for cache-busting of style and script file references.
	 *
	 * @since 1.0.0
	 *
	 * @var string
	 */
	public $version = SGPM_VERSION;

	/**
	 * The name of the plugin.
	 *
	 * @since 1.0.0
	 *
	 * @var string
	 */
	public $pluginName = 'Popup Maker WP';

	/**
	 * Unique plugin slug identifier.
	 *
	 * @since 1.0.0
	 *
	 * @var string
	 */
	public $pluginSlug = 'sgpmpopupmaker';

	/**
	 * Notification engine object.
	 *
	 * @since 1.2.3.0
	 *
	 * @var string
	 */
	public $notificationEngine = null;

	/**
	 * Helper utilities.
	 *
	 * @var SGPMHelper|null
	 */
	protected $helper = null;

	/**
	 * Menu handler instance.
	 *
	 * @var SGPMMenu|null
	 */
	protected $menu = null;

	/**
	 * API handler instance.
	 *
	 * @var SGPMApi|null
	 */
	protected $api = null;

	/**
	 * Front-end output handler.
	 *
	 * @var SGPMOutput|null
	 */
	protected $output = null;

	/**
	 * Loads the plugin into WordPress.
	 *
	 * @since 1.0.0
	 */
	public function init()
	{
		// Autoload the class files.
		spl_autoload_register('SGPMBase::autoload');
		register_activation_hook(SGPM_PATH.'popup-maker-api.php', array('SGPMBase', 'activate'));
		register_uninstall_hook(SGPM_PATH.'popup-maker-api.php', array('SGPMBase', 'uninstall'));
		register_deactivation_hook(SGPM_PATH.'popup-maker-api.php', array('SGPMBase', 'deactivate'));
		// update data of old user
		add_action('plugins_loaded', array($this, 'overallInit'));
		/**
		 * remove comments for testing
		 *
		 * add_action('plugins_loaded', array($this, 'fetchNewNotifications'));
		 */

		$this->helper = new SGPMHelper();
		$this->menu = new SGPMMenu();
		$this->api = new SGPMApi();
		$this->output = new SGPMOutput();
		add_action('init', array($this, 'registerDataConfig'), 99999);
		add_action('admin_init', array($this, 'registerNotificationEngine'), 99999);

		add_action('admin_notices', array($this, 'showNotificationsShade'));
		add_action('admin_enqueue_scripts', array($this, 'adminStyles'));

		// ajax call endpoint for all "Clear all Notiifcations" Button
		add_action('wp_ajax_sgpm_clear_all_notifications', array($this, 'clearAllNotifications'));
		add_action('wp_ajax_sgpm_remove_notification', array($this, 'removeNotification'));

		/* temprory fix : Delete old crons */
		wp_clear_scheduled_hook("sgpm_fetch_new_notifications");
		wp_unschedule_event(time(), 'sgpm_check_for_new_notifications_every_6_hours');

	}

	public function adminStyles()
	{
		wp_register_style($this->pluginSlug.'-admin', SGPM_ASSETS_URL.'css/admin.css', array(), $this->version);
		wp_enqueue_style($this->pluginSlug.'-admin');
		wp_register_style($this->pluginSlug.'-notification-shade', SGPM_ASSETS_URL.'css/notification-shade.css', array(), $this->version);
		wp_enqueue_style($this->pluginSlug.'-notification-shade');
	}

	public function showNotificationsShade()
	{
		$isPluginScreen = false;

		if (function_exists('get_current_screen')) {
			$screen = get_current_screen();
			$isPluginScreen = strpos($screen->id, 'popup-maker-api-settings');
		}

		$this->notificationEngine->setNotificationBadgeData();

		if ($isPluginScreen) {
			$this->notificationEngine->create();
		}
	}

	public function clearAllNotifications()
	{
		$this->notificationEngine->clearAllNotifications();
	}

	public function removeNotification()
	{
		// Verify nonce
		if ( ! isset($_POST['notificationType']) || ! isset($_POST['hash']) || ! isset($_POST['notificationId']) || ! wp_verify_nonce($_POST['notificationType'], 'notificationType_action') ) {
			wp_send_json_error('Nonce verification failed'); // Send an error response and exit
		}

		$notificationType = sanitize_text_field($_POST['notificationType']);

		if ($notificationType == 'review') {
			add_option('sgpm_popup_maker_dismiss_review_notice', 'true');
			return;
		}

		$hash = sanitize_key($_POST['hash']);
		$notificationId = sanitize_text_field($_POST['notificationId']);
		$this->notificationEngine->removeNotification($hash, $notificationId);
	}

	public function registerDataConfig()
	{
		if (file_exists(SGPM_CLASSES.'SGPMDataConfig.php')) {
			require_once(SGPM_CLASSES.'SGPMDataConfig.php');
			SGPMDataConfig::init();
		}
	}

	public function registerNotificationEngine()
	{
		if (file_exists(SGPM_CLASSES.'SGPMNotificationEngine.php')) {
			require_once(SGPM_CLASSES.'SGPMNotificationEngine.php');
			$this->notificationEngine = SGPMNotificationEngine::getInstance();
		}
	}

	public static function validateNotificationsBody($body)
	{
		if (isset($body[0])) {
			$notifications = $body[0];

			return isset($notifications['title']);
		}
	}

	public function overallInit()
	{
		$options = get_option('sgpm_popup_maker_api_option');
		if (empty($options)) {
			$options = array();
		}
		if (isset($options['pluginVersion']) && $options['pluginVersion'] >= '1.13') return;

		$options['pluginVersion'] = SGPM_VERSION;
	 	if (!isset($options['popups'])) return;

	 	foreach ($options['popups'] as $popupId => $popup) {
	  		if (!isset($options['popupsSettings'][$popupId])) continue;
	  		$popupSettings = $options['popupsSettings'][$popupId];

			if (!isset($popupSettings['displayTarget'])) {
				$popupSettings['displayTarget'] = $this->getUpdatedSettingsForOldUser($popupSettings);
				$options['popupsSettings'][$popupId] = $popupSettings;
			}
	 	}

		update_option('sgpm_popup_maker_api_option', $options);
	}

	public function getUpdatedSettingsForOldUser($popupSettings)
	{
		$updatedSettings = array();

		if (isset($popupSettings['showOnAllPosts']) && $popupSettings['showOnAllPosts'] == 'on') {
			$updatedSettings[] = array(
				'param' => 'post_all',
				'operator' => '=='
			);
		}
		if (isset($popupSettings['showOnSomePosts']) && $popupSettings['showOnSomePosts'] == 'on') {
			$updatedSettings[] = array(
				'param' => 'post_selected',
				'operator' => '==',
				'value' => $this->getSelectedPostAssocArray($popupSettings['selectedPosts'])
			);
		}
		if (isset($popupSettings['showOnAllPages']) && $popupSettings['showOnAllPages'] == 'on') {
			$updatedSettings[] = array(
				'param' => 'page_all',
				'operator' => '=='
			);
			$updatedSettings[] = array(
				'param' => 'page_type',
				'operator' => '==',
				'value' => array('is_home_page')
			);
		}
		if (isset($popupSettings['showOnSomePages']) && $popupSettings['showOnSomePages'] == 'on') {
			$updatedSettings[] = array(
				'param' => 'page_selected',
				'operator' => '==',
				'value' => $this->getSelectedPostAssocArray($popupSettings['selectedPages'])
			);

			if (in_array('-1', $popupSettings['selectedPages'])) {
				$updatedSettings[] = array(
					'param' => 'page_type',
					'operator' => '==',
					'value' => array('is_home_page')
				);
			}

		}
		return $updatedSettings;
	}

	public function getSelectedPostAssocArray($selectedPost)
	{
		$newSelectedPost = array();
		foreach ($selectedPost as $key => $selectedPostId) {
			if ($selectedPostId == '-1') continue;
			$newSelectedPost[$selectedPostId] = get_the_title($selectedPostId);
		}
		return $newSelectedPost;
	}

	public static function autoload($classname)
	{
		// Return early if not the proper classname.
		if ('SGPM' !== substr($classname, 0, 4)) {
			return;
		}
		// Check if the file exists. If so, load the file.
		$filename = SGPM_CLASSES.$classname.'.php';
		if (file_exists($filename)) {
			require_once($filename);
		}
	}

	public static function activate()
	{
		$activationDate = get_option('sgpm_popup_maker_activation_date');
   		if (!$activationDate) {
   			add_option('sgpm_popup_maker_activation_date', strtotime("now"));
   		}
	}

	public static function uninstall()
	{
		delete_option('sgpm_popup_maker_api_option');
		delete_option('sgpm_popup_maker_activation_date');
		delete_option('sgpm_popup_maker_dismiss_review_notice');
		delete_option('sgpm_popup_maker_notification_engine_source');
		delete_option('sgpm_popup_maker_dismissed_notifacions');
		delete_option('sgpm_popup_maker_user_roles');
		delete_option('sgpm_popup_maker_custom_allowed_tags');
		delete_option('sgpm_popup_maker_custom_allowed_attrs');

		/* temprory fix : Delete old crons */
		wp_clear_scheduled_hook("sgpm_fetch_new_notifications");
		wp_clear_scheduled_hook("sgpm_fetch_notifications");
		wp_unschedule_event(time(), 'sgpm_check_for_new_notifications_every_6_hours');
	}

	public static function deactivate()
	{
		/* temprory fix : Delete old crons */
		wp_clear_scheduled_hook("sgpm_fetch_new_notifications");
		wp_clear_scheduled_hook("sgpm_fetch_notifications");
		wp_unschedule_event(time(), 'sgpm_check_for_new_notifications_every_6_hours');
	}

	/**
	 * Returns the singleton instance of the class.
	 *
	 * @since 1.0.0
	 *
	 * @return SGPMBase
	 */
	/**
	 * Start application statistics tracking
	 *
	 * Use the WISDOM Tracking plugin to track
	 * application usage.
	 * https://wisdomplugin.com/support/#getting-started
	 *
	 * Filter: plugins_loaded
	 *
	 * @since  1.4.4
	 * @return void
	 */
	public function popup_maker_start_plugin_tracking() {
		if (class_exists('Plugin_Usage_Tracker')) {
			$wisdom = new Plugin_Usage_Tracker(
				SGPM_PATH.'popup-maker-api.php',
				'https://tracking.getawesomesupport.com',
				array(),
				true,
				true,
				1
			);
		}
	}

	public static function getInstance()
	{
		if (!isset( self::$instance ) && !(self::$instance instanceof SGPMBase)) {
			self::$instance = new SGPMBase();
		}

		return self::$instance;
	}
}
