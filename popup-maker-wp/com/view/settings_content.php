<div data-pws-tab="Settings" data-pws-tab-name="Settings">
	<div class="sgpm-tabs-content">
		<form id="sgpm-form-general-settings-save" class="sgpm-form" method="post" action="<?php echo esc_url(admin_url());?>admin-post.php">
			<input type="hidden" name="action" value="sgpm_general_settings_save">
			<?php wp_nonce_field('sgpm_general_settings_save', 'wp-nonce-token-general_settings-save'); ?>
			<?php
				global $wp_roles;
 				$roles = $wp_roles->get_names();
 				$selectedUserRoles = get_option('sgpm_popup_maker_user_roles');
				$selectedUserRoles = $selectedUserRoles ? $selectedUserRoles : array();
			?>
			<h2>User Role</h2>
			<br>
			<div class="sgpm-user-roles-value-wrapper">
				<div class="sgpm-user-roles-value-content">
					<span class="sgpm-margin-bottom-5">Choose the user roles who can use the plugin.</span>
					<select class="sgpm-select-user-roles-multiple" name="sgpm-selected-user-roles[]" multiple="multiple">
						<?php foreach ($roles as $key => $name):
							$selected = '';
						?>
							<?php
								if ($key == 'administrator') continue;
								if (in_array($key, $selectedUserRoles))  $selected = 'selected';
							?>
							<?php if (in_array($key, $selectedUserRoles)) ?>
							<option value="<?php echo esc_attr($key)?>" <?php echo esc_html($selected)?>><?php echo esc_html($name)?></option>
					  	<?php endforeach; ?>
					</select>
					<span class="sgpm-info-text"><small><strong>Attention: </strong>If you don't select any role, the plugin will be available for all user roles.</small></span>
				</div>
			</div>
			<h2>Custom HTML Tags</h2>
			<br>
			<div class="sgpm-custom-tags-wrapper">
				<div class="sgpm-custom-tags-content">
					<div class="sgpm-custom-tags-section">
						<label for="sgpm-custom-allowed-tags">
							<strong>Allowed custom HTML tags</strong>
						</label>
							<p class="sgpm-description">
								Enter the custom HTML tags you want to allow in popups, separated by commas.<br>
								<em>Example: custom-tag, my-component, special-element</em>
							</p>
						<textarea 
							id="sgpm-custom-allowed-tags" 
							name="sgpm-custom-allowed-tags" 
							rows="3" 
							cols="50" 
							placeholder="custom-tag, my-component, special-element"
							class="sgpm-textarea-large"
						><?php echo esc_textarea(get_option('sgpm_popup_maker_custom_allowed_tags', '')); ?></textarea>
					</div>
					
					<div class="sgpm-custom-attrs-section">
						<label for="sgpm-custom-allowed-attrs">
							<strong>Allowed custom HTML attributes</strong>
						</label>
							<p class="sgpm-description">
								Enter the custom HTML attributes you want to allow on all tags, separated by commas.<br>
								<em>Example: data-custom, my-attr, special-property</em>
							</p>
						<textarea 
							id="sgpm-custom-allowed-attrs" 
							name="sgpm-custom-allowed-attrs" 
							rows="3" 
							cols="50" 
							placeholder="data-custom, my-attr, special-property"
							class="sgpm-textarea-large"
						><?php echo esc_textarea(get_option('sgpm_popup_maker_custom_allowed_attrs', '')); ?></textarea>
					</div>
					
					<div class="sgpm-info-box">
							<h4>ℹ️ Important information:</h4>
						<ul>
								<li>Custom tags will be added to the already allowed base HTML tags</li>
								<li>Custom attributes will be applied to all allowed tags</li>
								<li>Make sure to enter only valid tag and attribute names</li>
								<li>This feature allows greater flexibility in creating custom popups</li>
						</ul>
					</div>
				</div>
			</div>
			
			<div class="sgpm-options-action-panel">
				<input class="sgpm-settings-save-btn sgpm-btn blue" type="submit" name="sgpm-submit" value="Save Changes" tabindex="749">
			</div>
		</form>
	</div>
</div>
