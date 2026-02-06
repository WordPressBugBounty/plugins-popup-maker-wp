<?php

class SGPMHelper
{
	public static function createSelectBox($data, $selectedValue, $attrs)
	{
		$attrString = '';
		$selected = '';
		$selectBoxCloseTag = '</select>';

		if (!empty($attrs) && isset($attrs)) {
			foreach ($attrs as $attrName => $attrValue) {
				$attrString .= ''.$attrName.'="'.$attrValue.'" ';
			}
		}

		$selectBox = '<select '.$attrString.'>';

		if (empty($data)) {
			$selectBox .= $selectBoxCloseTag;
			return $selectBox;
		}
		foreach ($data as $value => $label) {
			/*When is multiSelect*/
			if (is_array($selectedValue)) {
				$isSelected = in_array($value, $selectedValue);
				if ($isSelected) {
					$selected = 'selected';
				}
			}
			else if ($selectedValue == $value) {
				$selected = 'selected';
			}
			else if (is_array($value) && in_array($selectedValue, $value)) {
				$selected = 'selected';
			}

			if (is_array($label)) {
				$selectBox .= '<optgroup label="'.$value.'">';
					foreach ($label as $key => $optionLabel) {
						$selected = '';
						if (is_array($selectedValue)) {
							$isSelected = in_array($key, $selectedValue);
							if ($isSelected) {
								$selected = 'selected';
							}
						}
						else if ($selectedValue == $key) {
							$selected = 'selected';
						}
						else if (is_array($key) && in_array($selectedValue, $key)) {
							$selected = 'selected';
						}

						$selectBox .= '<option value="'.$key.'" '.$selected.'>'.$optionLabel.'</option>';
					}
				$selectBox .= '</optgroup>';
			}
			else {
				$selectBox .= '<option value="'.$value.'" '.$selected.'>'.$label.'</option>';
			}

			$selected = '';
		}

		$selectBox .= $selectBoxCloseTag;

		return $selectBox;
	}

	public static function createInput($data, $selectedValue, $attrs)
	{
		$attrString = '';
		$savedData = $data;

		if (!empty($selectedValue)) {
			$savedData = $selectedValue;
		}
		if (!empty($attrs) && isset($attrs)) {
			foreach ($attrs as $attrName => $attrValue) {
				$attrString .= ''.$attrName.'="'.$attrValue.'" ';
			}
		}

		$input = "<input $attrString value=\"$savedData\">";

		return $input;
	}

	public static function createCheckBox($data, $selectedValue, $attrs)
	{
		$attrString = '';
		$checked = '';

		if (!empty($selectedValue)) {
			$checked = 'checked';
		}
		if (!empty($attrs) && isset($attrs)) {
			foreach ($attrs as $attrName => $attrValue) {
				$attrString .= ''.$attrName.'="'.$attrValue.'" ';
			}
		}

		$input = "<input $attrString $checked>";

		return $input;
	}

	public static function getPostTypeData($args = array())
	{
		$defaultArgs = array(
			'offset'           =>  0,
			'orderby'          => 'date',
			'order'            => 'DESC',
			'post_status'      => 'publish',
			'suppress_filters' => false,
			'post_type'        => 'post',
			'posts_per_page'   => 1000
		);

		$args = wp_parse_args($args, $defaultArgs);

		$query = new WP_Query($args);

		$posts = array();
		foreach ($query->posts as $post) {
			$posts[$post->ID] = $post->post_title;
		}

		return $posts;
	}

	private static function getAllCustomPosts()
	{
		$args = array(
			'public' => true,
			'_builtin' => false
		);

		$allCustomPosts = get_post_types($args);

		return $allCustomPosts;
	}

	public static function addFilters()
	{
		self::addPostTypeToFilters();
	}

	private static function addPostTypeToFilters()
	{
		add_filter('sgpmPopupTargetParams', array(__CLASS__, 'addPopupTargetParams'), 1, 1);
		add_filter('sgpmPopupTargetData', array(__CLASS__, 'addPopupTargetData'), 1, 1);
		add_filter('sgpmPopupTargetTypes', array(__CLASS__, 'addPopupTargetTypes'), 1, 1);
		add_filter('sgpmPopupTargetAttrs', array(__CLASS__, 'addPopupTargetAttrs'), 1, 1);
		add_filter('sgpmPopupPageTemplates', array(__CLASS__, 'addPopupPageTemplates'), 1, 1);
	}

	public static function addPopupTargetParams($targetParams)
	{
		$allCustomPostTypes = self::getAllCustomPosts();

		foreach ($allCustomPostTypes as $customPostType) {
			$targetParams[$customPostType] = array(
				$customPostType.'_all' => 'All '.ucfirst($customPostType).'s',
				$customPostType.'_selected' => 'Selected '.ucfirst($customPostType).'s',
			);

			if ($customPostType == 'product') {
				$targetParams[$customPostType][$customPostType.'_selected_category'] = 'Category '.ucfirst($customPostType).'s';
			}
		}

		return $targetParams;
	}

	public static function addPopupTargetData($targetData)
	{
		$allCustomPostTypes = self::getAllCustomPosts();

		foreach ($allCustomPostTypes as $customPostType) {
			$targetData[$customPostType.'_all'] = null;
			$targetData[$customPostType.'_selected'] = '';
			$targetData[$customPostType.'_selected_category'] = '';
		}

		return $targetData;
	}

	public static function addPopupTargetTypes($targetTypes)
	{
		$allCustomPostTypes = self::getAllCustomPosts();

		foreach ($allCustomPostTypes as $customPostType) {
			$targetTypes[$customPostType.'_selected'] = 'select';
			$targetTypes[$customPostType.'_selected_category'] = 'select';
		}

		return $targetTypes;
	}

	public static function addPopupTargetAttrs($targetAttrs)
	{
		$allCustomPostTypes = self::getAllCustomPosts();

		foreach ($allCustomPostTypes as $customPostType) {

			$targetAttrs[$customPostType.'_selected'] = array('class' => 'js-sgpm-select2 js-select-ajax', 'data-select-class' => 'js-select-ajax', 'data-select-type' => 'ajax', 'data-value-param' => $customPostType, 'multiple' => 'multiple');

			if ($customPostType == 'product') {
				$targetAttrs[$customPostType.'_selected_category'] = array('class' => 'js-sgpm-select2 js-select-ajax', 'data-select-class' => 'js-select-ajax', 'data-select-type' => 'ajax', 'data-value-param' => $customPostType.'_cat', 'data-value-type' => 'category', 'multiple' => 'multiple');
			}
		}

		return $targetAttrs;
	}

	public static function addPopupPageTemplates($templates)
	{
		$pageTemplates = self::getPageTemplates();
		$pageTemplates += $templates;

		return $pageTemplates;
	}

	public static function getAllCustomPostTypes()
	{
		$args = array(
			'public' => true,
			'_builtin' => false
		);

		$allCustomPosts = get_post_types($args);

		return $allCustomPosts;
	}

	public static function getPostsAllCategories()
	{
		$categories = get_categories(
			array(
				'hide_empty' => 0,
				'type'      => 'post',
				'orderby'   => 'name',
				'order'     => 'ASC'
			)
		);
		$categoriesParams = array();
		foreach ($categories as $category) {
			$id = $category->term_id;
			$name = $category->name;
			$categoriesParams[$id] = $name;
		}

		return $categoriesParams;
	}

	public static function getPageTypes()
	{
		$postTypes = array();
		$postTypes['is_home_page'] = __('Home Page', 'sgpmPopupMaker');
		$postTypes['is_home'] = __('Posts Page', 'sgpmPopupMaker');
		$postTypes['is_search'] = __('Search Page', 'sgpmPopupMaker');
		$postTypes['is_404'] = __('404 Page', 'sgpmPopupMaker');

		return $postTypes;
	}

	public static function getPageTemplates()
	{
		$pageTemplates = array(
			'page.php' => __('Default Template', 'sgpmPopupMaker')
		);

		$templates = wp_get_theme()->get_page_templates();
		if (empty($templates)) {
			return $pageTemplates;
		}

		foreach ($templates as $key => $value) {

			$templateName = explode('/', $key);
			if (is_array($templateName)) {
				if (count($templateName) > 1) {
					$templateName = $templateName[1];
				}
				else {
					$templateName = $templateName[0];
				}
			}
			$pageTemplates[$templateName] = $value;

		}

		return $pageTemplates;
	}

	public static function taxonomySelectlist( $taxonomies = array(), $args = array(), $include_total = false ) {
		if ( empty ( $taxonomies ) ) {
			$taxonomies = array( 'category' );
		}

		$args = wp_parse_args( $args, array(
			'hide_empty' => false,
			'number'     => 10,
			'search'     => '',
			'include'    => null,
			'offset'     => 0,
			'page'       => null,
		) );

		if ( $args['page'] ) {
			$args['offset'] = ( $args['page'] - 1 ) * $args['number'];
		}

		// Query Caching.
		static $queries = array();

		$key = md5( serialize( $args ) );

		if ( ! isset( $queries[ $key ] ) ) {
			// Fetch terms using the updated approach
			$terms_array = get_terms( array(
				'taxonomy'   => $taxonomies, // Specify the taxonomy or array of taxonomies
				'hide_empty' => $args['hide_empty'],
				'number'     => $args['number'],
				'search'     => $args['search'],
				'include'    => $args['include'],
				'offset'     => $args['offset'],
				'paged'      => $args['paged'], // Correct parameter name is 'paged'
			) );

			$terms = array();
			foreach ( $terms_array as $term ) {
				$terms[ $term->name ] = $term->term_id;
			}

			$results = array(
				'items'       => $terms,
				'total_count' => $include_total ? wp_count_terms( array(
					'taxonomy'   => $taxonomies, // Specify the taxonomy or array of taxonomies
					'hide_empty' => $args['hide_empty'],
					'search'     => $args['search'],
					'include'    => $args['include'],
					'page'       => $args['page'], // Correct parameter name is 'page'
				)) : null,
			);

			$queries[ $key ] = $results;
		} else {
			$results = $queries[ $key ];
		}

		return ! $include_total ? $results['items'] : $results;
	}

	/**
	 * Validates custom HTML tags
	 *
	 * @param string $tagsString String of tags separated by commas
	 * @return array Valid tags
	 */
	public static function validateCustomTags($tagsString)
	{
		if (empty($tagsString)) {
			return array();
		}

		$tags = array_map('trim', explode(',', $tagsString));
		$validTags = array();

		foreach ($tags as $tag) {
			// Clean the tag
			$tag = preg_replace('/[^a-zA-Z0-9\-_]/', '', $tag);
			
			// Check that the tag is not empty and starts with a letter
			if (!empty($tag) && preg_match('/^[a-zA-Z]/', $tag)) {
				$validTags[] = strtolower($tag);
			}
		}

		return array_unique($validTags);
	}

	/**
	 * Validates custom HTML attributes
	 *
	 * @param string $attrsString String of attributes separated by commas
	 * @return array Valid attributes
	 */
	public static function validateCustomAttrs($attrsString)
	{
		if (empty($attrsString)) {
			return array();
		}

		$attrs = array_map('trim', explode(',', $attrsString));
		$validAttrs = array();

		foreach ($attrs as $attr) {
			// Clean the attribute
			$attr = preg_replace('/[^a-zA-Z0-9\-_:]/', '', $attr);
			
			// Check that the attribute is not empty and starts with a letter
			if (!empty($attr) && preg_match('/^[a-zA-Z]/', $attr)) {
				$validAttrs[] = strtolower($attr);
			}
		}

		return array_unique($validAttrs);
	}
}
