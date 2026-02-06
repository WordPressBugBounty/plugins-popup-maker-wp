<?php
/**
 * This is the class that sends all the data back to the home site
 * It alr handles opting in and deactivation
 * @version 1.2.4
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if( ! class_exists( 'Plugin_Usage_Tracker') ) {

	class Plugin_Usage_Tracker {

		private $wisdom_version = '1.2.4';
		private $home_url = '';
		private $plugin_file = '';
		private $plugin_name = '';
		private $options = array();
		private $include_goodbye_form = true;
		private $marketing = false;
		private $what_am_i = 'plugin';
		private $require_optin = true;
		private $theme_allows_tracking = 0;

		/**
		 * Class constructor
		 *
		 * @param $_home_url				The URL to the site we're sending data to
		 * @param $_plugin_file				The file path for this plugin
		 * @param $_options					Plugin options to track
		 * @param $_require_optin			Whether user opt-in is required (always required on WordPress.org)
		 * @param $_include_goodbye_form	Whether to include a form when the user deactivates
		 * @param $_marketing				Marketing method:
		 *									0: Don't collect email addresses
		 *									1: Request permission same time as tracking opt-in
		 *									2: Request permission after opt-in
		 */
		public function __construct(
			$_plugin_file,
			$_home_url,
			$_options,
			$_require_optin=true,
			$_include_goodbye_form=true,
			$_marketing=false ) {

			$this->plugin_file = $_plugin_file;
			$this->home_url = trailingslashit( $_home_url );

			// If the filename is 'functions' then we're tracking a theme
			if( basename( $this->plugin_file, '.php' ) != 'functions' ) {
				$this->plugin_name = basename( $this->plugin_file, '.php' );
			} else {
				$this->what_am_i = 'theme';
				$theme = wp_get_theme();
				if( $theme->Name ) {
					$this->plugin_name = sanitize_text_field( $theme->Name );
				}
			}

			$this->options = $_options;
			$this->require_optin = $_require_optin;
			$this->include_goodbye_form = $_include_goodbye_form;
			$this->marketing = $_marketing;

			// Only use this on switching theme
			$this->theme_allows_tracking = get_theme_mod( 'wisdom-allow-tracking', 0 );

			// Schedule / deschedule tracking when activated / deactivated
			if( $this->what_am_i == 'theme' ) {
				// Need to think about scheduling for sites that have already activated the theme
				add_action( 'after_switch_theme', array( $this, 'schedule_tracking' ) );
				add_action( 'switch_theme', array( $this, 'deactivate_this_plugin' ) );
			} else {
				register_activation_hook( $this->plugin_file, array( $this, 'schedule_tracking' ) );
				register_deactivation_hook( $this->plugin_file, array( $this, 'deactivate_this_plugin' ) );
			}

			// Get it going
			$this->init();

		}

		public function init() {
			// Deactivation - Keep only data collection during deactivation
			add_filter( 'plugin_action_links_' . plugin_basename( $this->plugin_file ), array( $this, 'filter_action_links' ) );
			add_action( 'admin_footer-plugins.php', array( $this, 'goodbye_ajax' ) );
			add_action( 'wp_ajax_goodbye_form', array( $this, 'goodbye_form_callback' ) );

		}

		/**
		 * Collect and send data
		 * Used only during deactivation
		 *
		 * @since 1.0.0
		 * @param $force	Not used, kept for compatibility
		 */
		public function do_tracking( $force=false ) {

			// If the home site hasn't been defined, we just drop out. Nothing much we can do.
			if ( ! $this->home_url ) {
				return;
			}

			$this->set_admin_email();

			// Get our data
			$body = $this->get_data();

			// Send the data
			$this->send_data( $body );

		}

		/**
		 * Send the data to the home site
		 *
		 * @since 1.0.0
		 */
		public function send_data( $body ) {
			$request = wp_remote_post(
				esc_url( $this->home_url . '?usage_tracker=hello' ),
				array(
					'method'      => 'POST',
					'timeout'     => 20,
					'redirection' => 5,
					'httpversion' => '1.1',
					'blocking'    => true,
					'body'        => $body,
					'user-agent'  => 'PUT/1.0.0; ' . home_url()
				)
			);

			$this->set_track_time();

			if( is_wp_error( $request ) ) {
				return $request;
			}

		}

		/**
		 * Here we collect most of the data
		 *
		 * @since 1.0.0
		 */
		public function get_data() {

			// Use this to pass error messages back if necessary
			$body['message'] = '';

			// Use this array to send data back
			$body = array(
				'plugin_slug'			=> sanitize_text_field( $this->plugin_name ),
				'url'							=> home_url(),
				'site_name' 			=> get_bloginfo( 'name' ),
				'site_version'		=> get_bloginfo( 'version' ),
				'site_language'		=> get_bloginfo( 'language' ),
				'charset'					=> get_bloginfo( 'charset' ),
				'wisdom_version'	=> $this->wisdom_version,
				'php_version'			=> phpversion(),
				'multisite'				=> is_multisite(),
				'file_location'		=> __FILE__,
				'product_type'		=> esc_html( $this->what_am_i )
			);

			// Collect the email if the correct option has been set
			if( $this->get_can_collect_email() ) {
				$body['email'] = $this->get_admin_email();
			}
			$body['marketing_method'] = $this->marketing;

			$body['server'] = isset( $_SERVER['SERVER_SOFTWARE'] ) ? sanitize_text_field( wp_unslash( $_SERVER['SERVER_SOFTWARE'] ) ) : '';

			// Retrieve current plugin information
			if( ! function_exists( 'get_plugins' ) ) {
				include ABSPATH . '/wp-admin/includes/plugin.php';
			}

			// Check text direction
			$body['text_direction']	= 'LTR';
			if( function_exists( 'is_rtl' ) ) {
				if( is_rtl() ) {
					$body['text_direction']	= 'RTL';
				}
			} else {
				$body['text_direction']	= 'not set';
			}

			/**
			 * Get our plugin data
			 * Currently we grab plugin name and version
			 * Or, return a message if the plugin data is not available
			 * @since 1.0.0
			 */
			$plugin = $this->plugin_data();
			$body['status'] = 'Active'; // Never translated
			if( empty( $plugin ) ) {
				// We can't find the plugin data
				// Send a message back to our home site
				$body['message'] .= __( 'We can\'t detect any product information. This is most probably because you have not included the code snippet.', 'sgpmPopupMaker' );
				$body['status'] = 'Data not found'; // Never translated
			} else {
				if( isset( $plugin['Name'] ) ) {
					$body['plugin'] = sanitize_text_field( $plugin['Name'] );
				}
				if( isset( $plugin['Version'] ) ) {
					$body['version'] = sanitize_text_field( $plugin['Version'] );
				}

			}

			/**
			 * Get our theme data
			 * Currently we grab theme name and version
			 * @since 1.0.0
			 */
			$theme = wp_get_theme();
			if( $theme->Name ) {
				$body['theme'] = sanitize_text_field( $theme->Name );
			}
			if( $theme->Version ) {
				$body['theme_version'] = sanitize_text_field( $theme->Version );
			}
			if( $theme->Template ) {
				$body['theme_parent'] = sanitize_text_field( $theme->Template );
			}

			// Return the data
			return $body;

		}

		/**
		 * Return plugin data
		 * @since 1.0.0
		 */
		public function plugin_data() {
			// Being cautious here
			if( ! function_exists( 'get_plugin_data' ) ) {
				include ABSPATH . '/wp-admin/includes/plugin.php';
			}
			// Retrieve current plugin information
			$plugin = get_plugin_data( $this->plugin_file );
			return $plugin;
		}

		/**
		 * Activating plugin
		 * Collect data during activation
		 * @since 1.0.0
		 */
		public function schedule_tracking() {
			$body = $this->get_data();
			$body['status'] = 'Activated'; // Never translated
			$body['activated_date'] = time();

			$this->send_data( $body );
		}

		/**
		 * Deactivating plugin
		 * Collect data during deactivation
		 * @since 1.0.0
		 */
		public function deactivate_this_plugin() {
			$body = $this->get_data();
			$body['status'] = 'Deactivated'; // Never translated
			$body['deactivated_date'] = time();

			// Add deactivation form data
			if( false !== get_option( 'wisdom_deactivation_reason_' . $this->plugin_name ) ) {
				$body['deactivation_reason'] = get_option( 'wisdom_deactivation_reason_' . $this->plugin_name );
			}
			if( false !== get_option( 'wisdom_deactivation_details_' . $this->plugin_name ) ) {
				$body['deactivation_details'] = get_option( 'wisdom_deactivation_details_' . $this->plugin_name );
			}

			$this->send_data( $body );
			// Clear scheduled update
			wp_clear_scheduled_hook( 'put_do_weekly_action' );

			// Clear the wisdom_last_track_time value for this plugin
			// @since 1.2.2
			$track_time = get_option( 'wisdom_last_track_time' );
			if( isset( $track_time[$this->plugin_name]) ) {
				unset( $track_time[$this->plugin_name] );
			}
			update_option( 'wisdom_last_track_time', $track_time );

		}

		/**
		 * Record the time we send tracking data
		 * @since 1.1.1
		 */
		public function set_track_time() {
			// We've tracked, so record the time
			$track_times = get_option( 'wisdom_last_track_time', array() );
			// Set different times according to plugin, in case we are tracking multiple plugins
			$track_times[$this->plugin_name] = time();
			update_option( 'wisdom_last_track_time', $track_times );
		}


		/**
		 * Can we collect the email address?
		 * @since 1.0.0
		 */
		public function get_can_collect_email() {
			// The wisdom_collect_email option is an array of plugins that are being tracked
			$collect_email = get_option( 'wisdom_collect_email' );
			// If this plugin is in the array, then we can collect the email address
			if( isset( $collect_email[$this->plugin_name] ) ) {
				return true;
			}
			return false;
		}

		/**
		 * Get the correct email address to use
		 * @since 1.1.2
		 * @return Email address
		 */
		public function get_admin_email() {
			// The wisdom_collect_email option is an array of plugins that are being tracked
			$email = get_option( 'wisdom_admin_emails' );
			// If this plugin is in the array, then we can collect the email address
			if( isset( $email[$this->plugin_name] ) ) {
				return $email[$this->plugin_name];
			}
			return false;
		}

		/**
		 * Set the correct email address to use
		 * There might be more than one admin on the site
		 * So we only use the first admin's email address
		 * @param $email	Email address to set
		 * @param $plugin	Plugin name to set email address for
		 * @since 1.1.2
		 */
		public function set_admin_email( $email=null, $plugin=null ) {
			if( empty( $plugin ) ) {
				$plugin = $this->plugin_name;
			}
			// If no email address passed, try to get the current user's email
			if( empty( $email ) ) {
				// Have to check that current user object is available
				if( function_exists( 'wp_get_current_user' ) ) {
					$current_user = wp_get_current_user();
					$email = $current_user->user_email;
				}
			}
			// The wisdom_admin_emails option is an array of admin email addresses
			$admin_emails = get_option( 'wisdom_admin_emails' );
			if( empty( $admin_emails ) || ! is_array( $admin_emails ) ) {
				// If nothing exists in the option yet, start a new array with the plugin name
				$admin_emails = array( $plugin => sanitize_email( $email ) );
			} else if( empty( $admin_emails[$plugin] ) ) {
				// Else add the email address to the array, if not already set
				$admin_emails[$plugin] = sanitize_email( $email );
			}
			update_option( 'wisdom_admin_emails', $admin_emails );
		}

		/**
		 * Filter the deactivation link to allow us to present a form when the user deactivates the plugin
		 * @since 1.0.0
		 */
		public function filter_action_links( $links ) {
			// Always show the form if include_goodbye_form is true, regardless of tracking status
			if( isset( $links['deactivate'] ) && $this->include_goodbye_form ) {
				$deactivation_link = $links['deactivate'];
				// Insert an onClick action to allow form before deactivating
				$deactivation_link = str_replace( '<a ', '<div class="put-goodbye-form-wrapper"><span class="put-goodbye-form" id="put-goodbye-form-' . esc_attr( $this->plugin_name ) . '"></span></div><a id="put-goodbye-link-' . esc_attr( $this->plugin_name ) . '" ', $deactivation_link );
				$links['deactivate'] = $deactivation_link;
			}
			return $links;
		}

		/*
		 * Form text strings
		 * These are non-filterable and used as fallback in case filtered strings aren't set correctly
		 * @since 1.0.0
		 */
		public function form_default_text() {
			$form = array();
			$form['heading'] = __( 'Sorry to see you go', 'sgpmPopupMaker' );
			$form['body'] = __( 'Before you deactivate the plugin, would you quickly give us your reason for doing so?', 'sgpmPopupMaker' );
			$form['options'] = array(
				__( 'Set up is too difficult', 'sgpmPopupMaker' ),
				__( 'Lack of documentation', 'sgpmPopupMaker' ),
				__( 'Not the features I wanted', 'sgpmPopupMaker' ),
				__( 'Found a better plugin', 'sgpmPopupMaker' ),
				__( 'Installed by mistake', 'sgpmPopupMaker' ),
				__( 'Only required temporarily', 'sgpmPopupMaker' ),
				__( 'Didn\'t work', 'sgpmPopupMaker' )
			);
			$form['details'] = __( 'Details (optional)', 'sgpmPopupMaker' );
			return $form;
		}

		/**
		 * Form text strings
		 * These can be filtered
		 * The filter hook must be unique to the plugin
		 * @since 1.0.0
		 */
		public function form_filterable_text() {
			$form = $this->form_default_text();
			return apply_filters( 'wisdom_form_text_' . esc_attr( $this->plugin_name ), $form );
		}

		/**
		 * Form text strings
		 * These can be filtered
		 * @since 1.0.0
		 */
		public function goodbye_ajax() {
			// Get our strings for the form
			$form = $this->form_filterable_text();
			if( ! isset( $form['heading'] ) || ! isset( $form['body'] ) || ! isset( $form['options'] ) || ! is_array( $form['options'] ) || ! isset( $form['details'] ) ) {
				// If the form hasn't been filtered correctly, we revert to the default form
				$form = $this->form_default_text();
			}
			// Build the HTML to go in the form
			$html = '<div class="put-goodbye-form-head"><strong>' . esc_html( $form['heading'] ) . '</strong></div>';
			$html .= '<div class="put-goodbye-form-body"><p>' . esc_html( $form['body'] ) . '</p>';
			if( is_array( $form['options'] ) ) {
				$html .= '<div class="put-goodbye-options" id="put-options-container">';
				// We'll create checkboxes via JavaScript to avoid DOM sanitization
				$html .= '</div>';
				$html .= '<div style="margin-top: 15px;"><label for="put-goodbye-reasons" style="display: block; margin-bottom: 5px;">' . esc_html( $form['details'] ) .'</label><textarea name="put-goodbye-reasons" id="put-goodbye-reasons" rows="2" style="width:100%; padding: 8px; border: 1px solid #ddd; border-radius: 3px;"></textarea></div>';
			}
			$html .= '</div><!-- .put-goodbye-form-body -->';
			$html .= '<p class="deactivating-spinner"><span class="spinner"></span> ' . __( 'Submitting form', 'sgpmPopupMaker' ) . '</p>';
			
			// Prepare options data for JavaScript
			$options_json = array();
			foreach( $form['options'] as $option ) {
				$options_json[] = array(
					'id' => sanitize_title( $option ),
					'value' => $option
				);
			}
			?>
			<div class="put-goodbye-form-bg"></div>
			<style type="text/css">
				.put-form-active .put-goodbye-form-bg {
					background: rgba( 0, 0, 0, .5 );
					position: fixed;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					z-index: 999998;
				}
				.put-goodbye-form-wrapper {
					position: fixed;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					z-index: 999999;
					display: none;
					align-items: center;
					justify-content: center;
				}
				.put-form-active .put-goodbye-form-wrapper {
					display: flex;
				}
				.put-goodbye-form {
					display: none;
				}
				.put-form-active .put-goodbye-form {
					position: relative;
					max-width: 500px;
					width: 90%;
					background: #fff;
					white-space: normal;
					border-radius: 4px;
					box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
					z-index: 1000000;
				}
				.put-goodbye-form-head {
					background: #0073aa;
					color: #fff;
					padding: 15px 20px;
					border-radius: 4px 4px 0 0;
				}
				.put-goodbye-form-body {
					padding: 20px;
					color: #444;
					max-height: 60vh;
					overflow-y: auto;
				}
				.put-goodbye-form-body p {
					margin-top: 0;
				}
				.put-goodbye-options {
					margin: 15px 0;
				}
				.put-goodbye-options p {
					margin: 0 0 15px 0;
				}
				.put-goodbye-options input[type="checkbox"],
				#put-goodbye-form-popup-maker-api input[type="checkbox"],
				.put-goodbye-form input[type="checkbox"] {
					margin-right: 8px !important;
					width: 18px !important;
					height: 18px !important;
					display: inline-block !important;
					vertical-align: middle !important;
					opacity: 1 !important;
					visibility: visible !important;
					appearance: checkbox !important;
					-webkit-appearance: checkbox !important;
					-moz-appearance: checkbox !important;
					position: relative !important;
					clip: auto !important;
					clip-path: none !important;
					margin-left: 0 !important;
					margin-top: 0 !important;
					margin-bottom: 0 !important;
					cursor: pointer !important;
					flex-shrink: 0 !important;
				}
				.put-goodbye-options label {
					display: inline-block;
					margin-bottom: 10px;
					margin-left: 5px;
					cursor: pointer;
					vertical-align: middle;
					font-weight: normal;
				}
				.put-goodbye-options textarea {
					width: 100%;
					margin-top: 10px;
					padding: 8px;
					border: 1px solid #ddd;
					border-radius: 3px;
					font-family: inherit;
					resize: vertical;
				}
				.deactivating-spinner {
					display: none;
					text-align: center;
					padding: 20px;
				}
				.deactivating-spinner .spinner {
					float: none;
					margin: 0 auto;
					vertical-align: middle;
					visibility: visible;
				}
				.put-goodbye-form-footer {
					padding: 15px 20px;
					border-top: 1px solid #ddd;
					text-align: right;
				}
				.put-goodbye-form-footer .button {
					margin-left: 10px;
				}
			</style>
			<script>
				jQuery(document).ready(function($){
					var optionsData = <?php echo json_encode( $options_json ); ?>;
					
					$("#put-goodbye-link-<?php echo esc_attr( $this->plugin_name ); ?>").on("click",function(e){
						e.preventDefault();
						// We'll send the user to this deactivation link when they've completed or dismissed the form
						var url = $(this).attr('href');
						$('body').toggleClass('put-form-active');
						$("#put-goodbye-form-<?php echo esc_attr( $this->plugin_name ); ?>").fadeIn();
						$("#put-goodbye-form-<?php echo esc_attr( $this->plugin_name ); ?>").html( '<?php echo wp_kses_post($html); ?>' + '<div class="put-goodbye-form-footer"><p><a id="put-submit-form" class="button primary" href="#"><?php esc_html_e( 'Submit and Deactivate', 'sgpmPopupMaker' ); ?></a>&nbsp;<a class="secondary button" href="'+url+'"><?php esc_html_e( 'Just Deactivate', 'sgpmPopupMaker' ); ?></a></p></div>');
						
						// Create checkboxes dynamically after HTML injection to avoid DOM sanitization
						var container = $('#put-options-container');
						if (container.length && optionsData) {
							container.empty();
							optionsData.forEach(function(option) {
								var optionId = 'put-checkbox-' + option.id;
								var div = $('<div>').css({
									'margin-bottom': '12px',
									'line-height': '1.5'
								});
								
								var checkbox = $('<input>', {
									type: 'checkbox',
									name: 'put-goodbye-options[]',
									id: optionId,
									value: option.value
								}).css({
									'display': 'inline-block',
									'width': '18px',
									'height': '18px',
									'margin-right': '10px',
									'vertical-align': 'middle',
									'opacity': '1',
									'visibility': 'visible',
									'appearance': 'checkbox',
									'-webkit-appearance': 'checkbox',
									'-moz-appearance': 'checkbox',
									'position': 'relative',
									'cursor': 'pointer'
								});
								
								var label = $('<label>', {
									'for': optionId,
									text: option.value
								}).css({
									'display': 'inline-block',
									'vertical-align': 'middle',
									'cursor': 'pointer',
									'font-weight': 'normal',
									'margin': '0'
								});
								
								div.append(checkbox).append(label);
								container.append(div);
							});
						}
						
						$('#put-submit-form').on('click', function(e){
							// As soon as we click, the body of the form should disappear
							$("#put-goodbye-form-<?php echo esc_attr( $this->plugin_name ); ?> .put-goodbye-form-body").fadeOut();
							$("#put-goodbye-form-<?php echo esc_attr( $this->plugin_name ); ?> .put-goodbye-form-footer").fadeOut();
							// Fade in spinner
							$("#put-goodbye-form-<?php echo esc_attr( $this->plugin_name ); ?> .deactivating-spinner").fadeIn();
							e.preventDefault();
							var values = new Array();
							$.each($("input[name='put-goodbye-options[]']:checked"), function(){
								values.push($(this).val());
							});
							var details = $('#put-goodbye-reasons').val();
							var data = {
								'action': 'goodbye_form',
								'values': values,
								'details': details,
								'security': "<?php echo wp_kses_post(wp_create_nonce ( 'wisdom_goodbye_form' )); ?>",
								'dataType': "json"
							}
							$.post(
								ajaxurl,
								data,
								function(response){
									// Redirect to original deactivation URL
									window.location.href = url;
								}
							);
						});
						// If we click outside the form, the form will close
						$('.put-goodbye-form-bg').on('click',function(){
							$("#put-goodbye-form-<?php echo esc_attr( $this->plugin_name ); ?>").fadeOut();
							$('body').removeClass('put-form-active');
						});
					});
				});
			</script>
		<?php }

		/**
		 * AJAX callback when the form is submitted
		 * Collect data when deactivation form is submitted
		 * @since 1.0.0
		 */
		public function goodbye_form_callback() {
			check_ajax_referer( 'wisdom_goodbye_form', 'security' );
			//Check permission for capability of current user
			if ( ! current_user_can( 'manage_options') ) {
				wp_send_json_error( array('message' => __('Unauthorized action. You do not have permission to submit goodbye form.', 'sgpmPopupMaker') ), 403);
 
			}
			if( isset( $_POST['values'] ) ) {
				$values = isset( $_POST['values'] ) ? json_encode( array_map( 'sanitize_text_field', wp_unslash( $_POST['values'] ) ) ) : '';
				update_option( 'wisdom_deactivation_reason_' . $this->plugin_name, $values );
			}
			if( isset( $_POST['details'] ) ) {
				$details = (sanitize_text_field( wp_unslash( $_POST['details'] )));
				update_option( 'wisdom_deactivation_details_' . $this->plugin_name, $details );
			}
			$this->do_tracking();
			echo 'success';
			wp_die();
		}

	}

}

