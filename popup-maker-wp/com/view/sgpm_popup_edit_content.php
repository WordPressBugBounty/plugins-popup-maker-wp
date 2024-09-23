<?php
if (!defined('ABSPATH')) exit;

?>
<div class="sgpm-container">
	<div class="sgpm-content">
		<div class="sgpm-wrapper">
			<?php if (isset($options['isAuthenticate']) && !$options['isAuthenticate'] && isset($_GET['tryconnect']) && wp_verify_nonce($ajax_nonce, SGPM_AJAX_NONCE)): ?>
				<div class="error">
					<p>You must provide a valid API Key to authenticate to Popup Maker.</p>
				</div>
			<?php endif; ?>
			<div class="sgpm-tab-container">
				<?php if (isset($options['isAuthenticate']) && $options['isAuthenticate']): ?>
					<div data-pws-tab="Popups" data-pws-tab-name="Popups">
						<div class="sgpm-tabs-content">
							<div class="sgpm-content">
								<form id="sgpm-form-options-save" class="sgpm-form" method="post" action="<?php echo esc_url(admin_url());?>admin-post.php">
									<input type="hidden" name="action" value="sgpm_options_save">
									<input type="hidden" name="sgpm-popup-id" value="<?php echo esc_attr($popupId)?>">
									<?php wp_nonce_field('sgpm_options_save', 'wp-nonce-token-options-save'); ?>
									<h3>
										<span class="sgpm-red"><?php echo esc_html($popup['title'])?></span> Settings
									</h3>

									<?php
									$conditionType = null;
										foreach ($popupSettings['displayTarget'] as $target) {
											if (isset($target['condition_type'])) {
												$conditionType = $target['condition_type'];
												break;
											}
										}
									?>

									<div class="sgpm-margin-top-30">
										<input type="radio" class="sgpm-popup-conditions sgpm-everywhere" name="sgpm-condition-type" value="everywhere" id="sgpm-show-everywhere"
											<?php echo ($conditionType == 'everywhere')?'checked':''; ?>
										>
										<label for="sgpm-show-everywhere">Show Popup Everywhere</label>
									</div>
									<div class="sgpm-margin-top-30">
										<input type="radio" class="sgpm-popup-conditions sgpm-custom" name="sgpm-condition-type" value="custom" id="sgpm-custom-selectors"
											<?php echo (isset($popupSettings['displayTarget']) && $conditionType == null)?'checked':''; ?>
										>
										<label for="sgpm-custom-selectors">Custom Selectors</label>
									</div>

									<div class="sgpm-margin-top-30 sgpm-margin-left-25 sgpm-popup-conditions-wrapper sgpm-popup-conditions-displayTarget" data-condition-type="displayTarget">
										<?php
										global $SGPM_DATA_CONFIG_ARRAY;
										$displayTargetData = (isset($popupSettings['displayTarget'])) ? $popupSettings['displayTarget'] : $SGPM_DATA_CONFIG_ARRAY['displayTarget']['initialData'];
										$creator = new SGPMCondition($displayTargetData);
										echo wp_kses($creator->render(), array(
											'div' => array('class' => [], 'data-condition-name' => [], 'data-rule-id'=>[]),
											'i' => array('class' => []),
											'ul' => array('class' => []),
											'li' => array('class' => [], 'tilte' =>[]),
											'a' => array('class' => [], 'href' => [], 'data-id'=>[]),
											'span' => array('class' => [], 'role' => [], 'aria-autocomplete'=>[], 'aria-haspopup'=>[], 'aria-expanded'=>[], 'tabindex'=>[]),
											'select' => array('class' => [], 'name' => [], 'data-select-type'=>[], 'autocomplete'=>[], 'multiple' => [], 'isnotposttype' => [], 'data-value-param'=>[]),
											'optgroup' => array('label' => [], 'value' => [], 'selected' => []), // Corrected the handling of optgroup attributes
											'option' => array('label' => [], 'value' => [], 'selected' => []) // Corrected the handling of optgroup attributes
										));
										?>
									</div>
									<div class="sgpm-options-action-panel">
										<a class="sgpm-go-back-action" href="<?php echo esc_url(SGPM_ADMIN_URL)."admin.php?page=popup-maker-api-settings"?>">Back</a>
										<input class="sgpm-options-save-btn button button-primary" type="submit" name="sgpm-submit" value="Save Changes" tabindex="749">
									</div>
								</form>
							</div>
						</div>
					</div>
				<?php endif; ?>
				<?php
				require_once(SGPM_VIEW.'sgpm_api_credentials_content.php');
				require_once(SGPM_VIEW.'templates_content.php');
				require_once(SGPM_VIEW.'sgpm_support_content.php');
				require_once(SGPM_VIEW.'settings_content.php');
				?>
			</div>
		</div>
	</div>
</div>
