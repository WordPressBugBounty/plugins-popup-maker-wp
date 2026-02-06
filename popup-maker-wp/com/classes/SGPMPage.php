<?php

class SGPMPage
{
	/**
	 * Reference to base plugin class.
	 *
	 * @var SGPMBase
	 */
	protected $base;

	public function __construct()
	{
		$this->set();
	}

	/**
	 * Sets our object instance and base class instance.
	 *
	 * @since 1.0.0
	 */
	public function set()
	{
		$this->base = SGPMBase::getInstance();
	}

	public function optionsSave()
	{
		//CSRF check
		if (!check_admin_referer('sgpm_options_save', 'wp-nonce-token-options-save')) {
			wp_die('Security check fail');
		}

		$diplayTarget = $this->getTargetData();

		$popupId = $this->sanitize('sgpm-popup-id');
		$options = get_option('sgpm_popup_maker_api_option');

		$options['popupsSettings'][$popupId]['displayTarget'] = $diplayTarget;
		update_option('sgpm_popup_maker_api_option', $options);

		wp_redirect(SGPM_ADMIN_URL."admin.php?page=popup-maker-api-settings&popupId=".$popupId);
		exit();
	}

	public function generalSettingsSave()
	{
		//CSRF check
		if (!check_admin_referer('sgpm_general_settings_save', 'wp-nonce-token-general_settings-save')) {
			wp_die('Security check fail');
		}

		$selectedUserRoles = isset($_POST['sgpm-selected-user-roles']) ? array_map( 'sanitize_text_field', $_POST['sgpm-selected-user-roles'] ) : array();
		update_option('sgpm_popup_maker_user_roles', $selectedUserRoles);

		// Save custom allowed tags
		$customAllowedTags = isset($_POST['sgpm-custom-allowed-tags']) ? sanitize_textarea_field($_POST['sgpm-custom-allowed-tags']) : '';
		update_option('sgpm_popup_maker_custom_allowed_tags', $customAllowedTags);

		// Save custom allowed attributes
		$customAllowedAttrs = isset($_POST['sgpm-custom-allowed-attrs']) ? sanitize_textarea_field($_POST['sgpm-custom-allowed-attrs']) : '';
		update_option('sgpm_popup_maker_custom_allowed_attrs', $customAllowedAttrs);

		wp_redirect(SGPM_ADMIN_URL."admin.php?page=popup-maker-api-settings");
	}

	public function changePopupStatus()
	{
		// AJAX check
		check_ajax_referer(SGPM_AJAX_NONCE, 'nonce_ajax');
		global $SGPM_DATA_CONFIG_ARRAY;
		$popupId = intval($this->sanitize('popupId'));
		$popupStatus = $this->sanitize('popupStatus');
		$options = get_option('sgpm_popup_maker_api_option');
		$options['popupsSettings'][$popupId]['status'] = $popupStatus;
		if ($popupStatus == 'enabled' && !isset($options['popupsSettings'][$popupId]['displayTarget'])) {
			$options['popupsSettings'][$popupId]['displayTarget'] = $SGPM_DATA_CONFIG_ARRAY['displayTarget']['initialData'];
		}

		update_option('sgpm_popup_maker_api_option', $options);
		exit();
	}

	public function init()
	{
		$this->render();
	}

	public function render()
	{
		$options = get_option('sgpm_popup_maker_api_option');
		$ajax_nonce = wp_create_nonce(SGPM_AJAX_NONCE);
		if (isset($_GET['popupId']) && wp_verify_nonce($ajax_nonce, SGPM_AJAX_NONCE)) {
			$popupId = sanitize_text_field($_GET['popupId']);
			$popup = $options['popups'][$popupId];
			if (isset($options['popupsSettings'][$popupId])) {
				$popupSettings = $options['popupsSettings'][$popupId];
			}
			require_once(SGPM_VIEW.'sgpm_popup_edit_content.php');
			return;
		}

		require_once(SGPM_VIEW.'sgpm_page_content.php');
	}

	public function sanitize($optionsKey)
	{
		$ajax_nonce = wp_create_nonce(SGPM_AJAX_NONCE);
		if (isset($_POST[$optionsKey])  && wp_verify_nonce($ajax_nonce, SGPM_AJAX_NONCE)) {
			return sanitize_text_field($_POST[$optionsKey]);
		}
		else {
			return "";
		}
	}

	public function select2SearchData()
	{
		// AJAX check
		check_ajax_referer(SGPM_AJAX_NONCE, 'nonce_ajax');

		$objectKey = sanitize_text_field($_POST['objectKey']);
		$search = sanitize_text_field($_POST['searchTerm']);
		$objectKey = sanitize_text_field($_POST['objectKey']);
		$searchType = sanitize_text_field($_POST['searchType']);
		$search = sanitize_text_field($_POST['searchTerm']);

		$include = sanitize_text_field($_REQUEST['include']);
		$page = sanitize_text_field($_REQUEST['page']);

		if ($searchType == 'category') {

			$taxonomy = ! empty($objectKey) ? $objectKey : 'category';

			$args = array(
				'search'  => ! empty($search) ? $search : '',
				'include' => ! empty( $include ) ? $include : null,
				'page'    => ! empty( $page ) ? absint( $page ) : null,
				'number'  => 10,
			);

			$query = SGPMHelper::taxonomySelectlist($taxonomy, $args, true);

			foreach ( $query['items'] as $name => $id ) {
				$results['items'][] = array(
					'id'   => $id,
					'text' => $name,
				);
			}
		}
		else {
			$args      = array(
				's'              => $search,
				'post__in'       => ! empty( $include ) ? array_map( 'intval', $include ) : null,
				'page'           => ! empty( $page ) ? absint( $page ) : null,
				'posts_per_page' => 10,
				'post_type'      => $objectKey
			);

			$searchResults = SGPMHelper::getPostTypeData($args);

			if (empty($searchResults)) {
				$results['items'] = array();
			}

			/*Selected custom post type convert for select2 format*/
			foreach ($searchResults as $id => $name) {
				$results['items'][] = array(
					'id'   => $id,
					'text' => $name
				);
			}
		}

		echo json_encode($results);
		wp_die();
	}

	public function addConditionRuleRow()
	{
		// AJAX check
		check_ajax_referer(SGPM_AJAX_NONCE, 'nonce_ajax');

		$data = '';
		global $SGPM_DATA_CONFIG_ARRAY;
		$targetType = $this->sanitize('conditionName');
		$ruleId = (int)sanitize_text_field($_POST['ruleId']);
		$conditionRule = $SGPM_DATA_CONFIG_ARRAY[$targetType]['initialData'][0];
		$data .= SGPMCondition::createConditionRuleRow($conditionRule, $ruleId);

		$allowed_html = $this->allowed_html_tags();
		echo wp_kses($data, $allowed_html);

		wp_die();
	}

	public function allowed_html_tags()
	{
		$allowedposttags = array();
		$allowedposttags = wp_kses_allowed_html( 'post' );
		$allowed_atts = array(
			'align'      => array(),
			'class'      => array(),
			'type'       => array(),
			'id'         => array(),
			'dir'        => array(),
			'lang'       => array(),
			'style'      => array(),
			'xml:lang'   => array(),
			'src'        => array(),
			'alt'        => array(),
			'href'       => array(),
			'rel'        => array(),
			'rev'        => array(),
			'target'     => array(),
			'novalidate' => array(),
			'type'       => array(),
			'value'      => array(),
			'name'       => array(),
			'tabindex'   => array(),
			'action'     => array(),
			'method'     => array(),
			'for'        => array(),
			'width'      => array(),
			'height'     => array(),
			'data-*'       => true,
			'title'      => array(),
			'attr'		=> array(),
			'label'		=> array(),
			'selected' => array(),
			'multiple' => array()
		);

		// Tags de base
		$base_tags = array(
			'select', 'optgroup', 'option', 'form', 'label', 'input', 'textarea', 
			'iframe', 'script', 'style', 'strong', 'small', 'table', 'span', 
			'abbr', 'code', 'pre', 'div', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 
			'h6', 'ol', 'ul', 'li', 'em', 'hr', 'br', 'tr', 'td', 'p', 'a', 'b', 'i'
		);

		// Appliquer les tags de base
		foreach ($base_tags as $tag) {
			$allowedposttags[$tag] = $allowed_atts;
		}

		// Get and validate custom allowed tags
		$customAllowedTags = get_option('sgpm_popup_maker_custom_allowed_tags', '');
		$customAllowedAttrs = get_option('sgpm_popup_maker_custom_allowed_attrs', '');

		$validCustomTags = SGPMHelper::validateCustomTags($customAllowedTags);
		$validCustomAttrs = SGPMHelper::validateCustomAttrs($customAllowedAttrs);

		// Apply validated custom tags
		foreach ($validCustomTags as $tag) {
			$allowedposttags[$tag] = $allowed_atts;
		}

		// Apply validated custom attributes
		if (!empty($validCustomAttrs)) {
			$customAttrsArray = array();
			foreach ($validCustomAttrs as $attr) {
				$customAttrsArray[$attr] = array();
			}
			
			// Apply custom attributes to all tags
			foreach ($allowedposttags as $tag => $attrs) {
				$allowedposttags[$tag] = array_merge($attrs, $customAttrsArray);
			}
		}

		return $allowedposttags;
	}

	public function changeConditionRuleRow()
	{
		// AJAX check
		check_ajax_referer(SGPM_AJAX_NONCE, 'nonce_ajax');

		$data = '';
		global $SGPM_DATA_CONFIG_ARRAY;

		$targetType = $this->sanitize('conditionName');
		$conditionConfig = $SGPM_DATA_CONFIG_ARRAY[$targetType];
		$ruleId = $this->sanitize('ruleId');
		$paramName = sanitize_text_field($_POST['paramName']);
		$savedData = array(
			'param' => 	$paramName
		);

		if ($targetType == 'displayTarget' || $targetType == 'conditions') {
			$savedData['operator'] = '==';
		}

		$savedData['value'] = $conditionConfig['paramsData'][$paramName];
		$data .= SGPMCondition::createConditionRuleRow($savedData, $ruleId);

		$allowed_html = $this->allowed_html_tags();
		echo wp_kses($data, $allowed_html);

		wp_die();
	}

	private function getTargetData()
	{
		$ajax_nonce = wp_create_nonce(SGPM_AJAX_NONCE);
		if (!wp_verify_nonce($ajax_nonce, SGPM_AJAX_NONCE)) {
			return array();
		}

		$conditionType = sanitize_text_field($_POST['sgpm-condition-type']);
		$targetData = $_POST['sgpm-display-target'];
		global $SGPM_DATA_CONFIG_ARRAY;
		$targetConfig = $SGPM_DATA_CONFIG_ARRAY['displayTarget'];
		$paramsData = $targetConfig['paramsData'];
		$attrs = $targetConfig['attrs'];
		$popupTarget = array();

		foreach ($targetData as $ruleId => $ruleData) {

			if (empty($ruleData['value']) && !is_null($paramsData[$ruleData['param']])) {
				$targetData[$ruleId]['value'] = '';
			}

			if (isset($ruleData['value']) && is_array($ruleData['value'])) {

				$valueAttrs = @$attrs[$ruleData['param']];
				$postType =  sanitize_text_field(@$valueAttrs['data-value-param']);
				$isNotPostType = sanitize_text_field(@$valueAttrs['isNotPostType']);
				$objectType = sanitize_text_field(@$valueAttrs['data-value-type']);

				if (empty($valueAttrs['isNotPostType'])) {
					$isNotPostType = false;
				}

				if ($objectType == 'category') {
					$searchResults = array();
					foreach ($ruleData['value'] as $key => $catId) {

						$catId = sanitize_text_field($catId);
						$cat = get_term_by('id', $catId, $postType);
						$searchResults[$catId] = $cat->name;

					}
					$targetData[$ruleId]['value'] = $searchResults;
				}
				else if (!$isNotPostType) {
					$args = array(
						'post__in' => array_values(array_map( 'sanitize_text_field', $ruleData['value'])),
						'posts_per_page' => 10,
						'post_type'      => $postType
					);
					$searchResults = SGPMHelper::getPostTypeData($args);
					$targetData[$ruleId]['value'] = $searchResults;
				}
			}
		}

		if ($conditionType == 'everywhere') {
			$targetData[] = array(
				'condition_type' => $conditionType
			);
		}

		return $targetData;
	}
}
