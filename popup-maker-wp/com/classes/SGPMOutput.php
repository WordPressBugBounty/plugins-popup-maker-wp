<?php

class SGPMOutput
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
		add_action('wp_head', array($this, 'output'));
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

	/**
	 * attach popup on website.
	 *
	 * @since 1.0.0
	 */
	public function output()
	{
		$options = get_option('sgpm_popup_maker_api_option');
		$postId = $pageId = get_the_ID();
		$popupHashIds = array();

		foreach ($options['popups'] as $popupId => $popup) {
			if (!isset($options['popupsSettings'][$popupId])) continue;
			$popupSettings = $options['popupsSettings'][$popupId];
			if (!isset($popupSettings['status']) || $popupSettings['status'] == 'disabled') continue;
			$displayTargets = $popupSettings['displayTarget'];

			foreach ($popupSettings['displayTarget'] as $displayTarget) {
				if (isset($displayTarget['condition_type']) && $displayTarget['condition_type'] == 'everywhere') {
					$displayTargets = $displayTarget['condition_type'];
				}
			}

			if ($this->allowToSetPopup($displayTargets)) {
				$popupHashIds[] = $popup['hashId'];
			}
		}

		if (!empty($popupHashIds)) {

			wp_enqueue_script( 'sgpm-default-embed-code', SGPM_ASSETS_URL.'js/defaultEmbedCode.js', array(), '1.0.0', false );
		    wp_localize_script( 'sgpm-default-embed-code', 'sgpmPopupHashIds',
		        $popupHashIds
		    );
		    // Use wp_add_inline_script for simple string values (WordPress 5.7+ requirement)
		    wp_add_inline_script( 'sgpm-default-embed-code', 'var SGPM_SERVICE_URL = "' . esc_js( SGPM_SERVICE_URL ) . '";', 'before' );
			wp_add_inline_script( 'sgpm-default-embed-code', 'var SGPM_ASSETS_URL = "' . esc_js( SGPM_ASSETS_URL ) . '";', 'before' );

		}

	}

	private function allowToSetPopup($displayTargets)
	{
		if ($displayTargets == 'everywhere') {
			return true;
		}

		$targetData = $this->divideIntoPermissiveAndForbidden($displayTargets);
		$isPostInForbidden = $this->isPostInForbidden($targetData);
		if ($isPostInForbidden) {
			return false;
		}
		$isPermissive = $this->isPermissive($targetData);
		return $isPermissive;
	}

	public function divideIntoPermissiveAndForbidden($postMetaData)
	{
		$permissive = array();
		$forbidden = array();

		foreach ($postMetaData as $data) {

			if (empty($data['operator'])) {
				break;
			}

			if ($data['operator'] == '==') {
				$permissive[] = $data;
			}
			else {
				$forbidden[] = $data;
			}
		}

		$postMetaDivideData = array(
			'permissive' => $permissive,
			'forbidden' => $forbidden
		);

		return $postMetaDivideData;
	}

	private function isPostInForbidden($target)
	{
		$isForbidden = false;

		if (empty($target['forbidden'])) {
			return $isForbidden;
		}

		foreach ($target['forbidden'] as $targetData) {
			if ($this->isInitPopup($targetData)) {
				$isForbidden = true;
				break;
			}
		}

		return $isForbidden;
	}

	private function isPermissive($target)
	{
		$isPermissive = false;

		if (empty($target['permissive'])) {
			$isPermissive = true;
			return $isPermissive;
		}

		foreach ($target['permissive'] as $targetData) {
			if ($this->isInitPopup($targetData)) {
				$isPermissive = true;
				break;
			}
		}

		return $isPermissive;
	}


	private function isInitPopup($targetData)
	{
		$isInit = false;
		$postId = $pageId = get_the_ID();
		$pageForPosts = get_option('page_for_posts');

		if (strpos($targetData['param'], '_all')) {
			$endIndex = strpos($targetData['param'], '_all');
			$postType = substr($targetData['param'], 0, $endIndex);
			$currentPostType = get_post_type($postId);

			if ($postType == $currentPostType) {
				$isInit = true;
			}
		}
		// for woocomerce
		else if (strpos($targetData['param'], '_selected_category')) {
			$terms = get_the_terms($postId, 'product_cat');
			if ($terms) {
				foreach ($terms as $key => $term) {
					if (in_array($term->name, $targetData['value'])) {
						$isInit = true;
						break;
					}
				}
			}
		}
		else if (strpos($targetData['param'], '_selected')) {
			$values = array();

			if (!empty($targetData['value'])) {
				$values = array_keys($targetData['value']);
			}

			if (in_array($postId, $values) || (is_Home() && in_array($pageForPosts, $values))) {
				$isInit = true;
			}
		}

		else if ($targetData['param'] == 'post_type' && !empty($targetData['value'])) {
			$selectedCustomPostTypes = array_values($targetData['value']);
			$currentPostType = get_post_type($postId);

			if (in_array($currentPostType, $selectedCustomPostTypes)) {
				$isInit = true;
			}
		}
		else if ($targetData['param'] == 'post_category' && !empty($targetData['value'])) {
			$values = $targetData['value'];
			$currentPostCategories = get_the_category($postId);

			foreach ($currentPostCategories as $categoryName) {
				if (in_array($categoryName->term_id, $values)) {
					$isInit = true;
					break;
				}

			}
		}
		else if ($targetData['param'] == 'page_type' && !empty($targetData['value'])) {
			$postTypes = $targetData['value'];
			foreach ($postTypes as $postType) {

				if ($postType == 'is_home_page') {
					if (is_front_page() && is_home()) {
						// Default homepage
						$isInit = true;
						break;
					} elseif (is_front_page()) {
						// static homepage
						$isInit = true;
						break;
					}
				}
				else if ($postType()) {
					$isInit = true;
					break;
				}
			}
		}
		else if ($targetData['param'] == 'page_template' && !empty($targetData['value'])) {

			$currentPageTemplate = basename(get_page_template());
			if (in_array($currentPageTemplate, $targetData['value'])) {
				$isInit = true;
			}
		}

		return $isInit;
	}
}
