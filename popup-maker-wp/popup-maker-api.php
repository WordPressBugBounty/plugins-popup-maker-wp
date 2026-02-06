<?php
/**
* Plugin Name: Popup Maker WP
* Plugin URI: https://popupmaker.com/wordpress
* Description: Popup Maker is the ultimate tool that will help you run a cleverer and more effective marketing popups for your website. Create the most optimal popups to boost your sales.
* Version: 1.4.4
* Author: Popup Maker
* License: GPL-2.0+
* Author URI: https://popupmaker.com/
*/
if (!defined('ABSPATH')) exit;

require_once(dirname(__FILE__).'/config.php');
require_once(SGPM_CLASSES.'SGPMBase.php');

/* Wisdom Tracking */
if (is_admin()) {
	require_once(dirname(__FILE__).'/tracking/class-plugin-usage-tracker.php');
	// Initialize tracker immediately so activation hook is registered in time
	if (class_exists('Plugin_Usage_Tracker')) {
		new Plugin_Usage_Tracker(
			__FILE__,
			'https://tracking.getawesomesupport.com',
			array(),
			true,
			true,
			1
		);
	}
}

$sgpmBase =  SGPMBase::getInstance();
$sgpmBase->init();
