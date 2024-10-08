<?php
if (!defined('ABSPATH')) exit;
//CSRF token for delete action
$ajax_nonce = wp_create_nonce(SGPM_AJAX_NONCE);
$popupChecker = true;
?>
<div class="sgpm-container">
	<div class="sgpm-content">
		<div class="sgpm-wrapper">
			<?php if (isset($options['isAuthenticate']) && !$options['isAuthenticate'] && isset($_GET['tryconnect']) && wp_verify_nonce($ajax_nonce, SGPM_AJAX_NONCE)) : ?>
				<div class="error">
					<p>You must provide a valid API Key to authenticate to Popup Maker.</p>
				</div>
			<?php endif; ?>
			<div class="sgpm-tab-container">
				<?php if (isset($options['isAuthenticate']) && $options['isAuthenticate']) : ?>
					<div data-pws-tab="Popups" data-pws-tab-name="Popups">
						<div class="sgpm-tabs-content">
							<?php if (isset($options['user']['isActive']) && $options['user']['isActive']) : ?>
								<?php if (!empty($options['popups'])) : ?>
									<?php if (sizeof($options['popups']) > 15) : ?>
										<p class="submit">
											<a href="javascript:;" class="sgpm-btn green-meadow refresh-popup-data-btn sgpm-text-decoration-none" name="sgpm-submit">
												<i class="dashicons dashicons-update"></i> Refresh popups list
											</a>
										</p>
									<?php endif; ?>
									<?php foreach ($options['popups'] as $popupId => $popup) :
										if ($popup['status'] == 0) { continue; }
										$popupStatus = 'disabled';
										$popupChecker = false;
										$checked = '';
										if (isset($options['popupsSettings'][$popupId]) && isset($options['popupsSettings'][$popupId]['status']) && $options['popupsSettings'][$popupId]['status']) {
											$popupStatus = $options['popupsSettings'][$popupId]['status'];
											if ($popupStatus == 'enabled') {
												$checked = 'checked';
											}
										}
									?>
										<div class="sgpm-popup-options-container" data-sgpm-popup-id="<?php echo esc_attr($popupId) ?>">
											<span class="sgpm-popup-status sgpm-popup-<?php echo esc_attr($popupStatus) ?>">
												<?php echo esc_html(ucfirst($popupStatus)); ?>
											</span>
											<span class="sgpm-popup-title"><?php echo esc_html($popup['title']) ?></span>
											<div class="sgpm-popup-options">
												<a class="sgpm-action-label sgpm-btn blue" href="<?php echo esc_url(SGPM_ADMIN_URL) . "admin.php?page=popup-maker-api-settings&popupId=" . esc_attr($popupId) ?>" title="Edit Display Conditions" alt="Edit Display Conditions">Select Pages / Posts <i class="dashicons dashicons-edit"></i>
												</a>
												<input type="checkbox" class="sgpm_lcs_check sgpm_lcs_tt1 sgpm-enable-disable-switch-button" <?php echo esc_attr($checked) ?> autocomplete="off" data-popup-id="<?php echo esc_attr($popupId) ?>">
												<div id="ajax-loader-<?php echo esc_attr($popupId) ?>" class="sgpm-setting-ajax-loader">
													<img src="<?php echo esc_url(SGPM_IMG_URL) ?>ajax-loading.gif" class="img-responsive" />
												</div>
											</div>
										</div>
										<div class="sgpm-popup-options-container">
											<hr>
										</div>
									<?php endforeach; ?>
								<?php endif; ?>
								<?php if (empty($options['popups']) || $popupChecker) : ?>
									<h3 class="sgpm-info-about-not-popups">
										Dear <span class="sgpm-black"><?php echo esc_html($options['user']['firstname']) ?></span> you have no popups created yet!
									</h3>
									<h4>
										Click <a href="<?php echo esc_url(SGPM_SERVICE_URL) . 'dashboard' ?>" title="Click here to create a new popup" target="_blank">here</a>
										to create an activate a new popup, after that, click on the <span class="sgpm-red">"Refresh popups list"</span> button.
									</h4>
								<?php endif; ?>
								<p class="submit">
									<a href="javascript:;" class="sgpm-btn green-meadow refresh-popup-data-btn sgpm-text-decoration-none" name="sgpm-submit">
										<i class="dashicons dashicons-update"></i> Refresh popups list
									</a>
								</p>
							<?php else : ?>
								<h3 class="sgpm-info-about-account-activate">
									Dear <span class="sgpm-black"><?php echo esc_html($options['user']['firstname']) ?></span> you must activate your Popup Maker account before use your popups.
								</h3>
								<h4 class="sgpm-info-about-activation-url">
									We have sent you an activation email for your Popup Maker account. Please, check and activate.
								</h4>
							<?php endif; ?>
						</div>
					</div>
				<?php endif; ?>
				<?php
				require_once(SGPM_VIEW . 'sgpm_api_credentials_content.php');
				require_once(SGPM_VIEW . 'templates_content.php');
				require_once(SGPM_VIEW . 'sgpm_support_content.php');
				require_once(SGPM_VIEW . 'settings_content.php');
				?>
			</div>
		</div>
	</div>
</div>
