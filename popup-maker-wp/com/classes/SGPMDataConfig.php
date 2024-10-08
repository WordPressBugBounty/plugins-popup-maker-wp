<?php

class SGPMDataConfig
{
	public static function init()
	{
		self::addFilters();
		self::initTargetData();
	}

	public static function addFilters()
	{
		SGPMHelper::addFilters();
	}

	public static function initTargetData()
	{
		global $SGPM_DATA_CONFIG_ARRAY;

		$targetElementTypes = array(
			'param' => 'select',
			'operator' => 'select',
			'value' => 'select',
			'post_selected' => 'select',
			'page_selected' => 'select',
			'post_type' => 'select',
			'post_category' => 'select',
			'page_type' => 'select',
			'page_template' => 'select'
		);
		$targetParams = array(
			'Post' => array(
				'post_all' => __('All posts', 'sgpmPopupMaker'),
				'post_selected' => __('Selected posts', 'sgpmPopupMaker'),
				'post_type' => __('Post type', 'sgpmPopupMaker'),
				'post_category' => __('Post category', 'sgpmPopupMaker')
			),
			'Page' => array(
				'page_all' => __('All pages', 'sgpmPopupMaker'),
				'page_selected' => __('Selected pages', 'sgpmPopupMaker'),
				'page_type' => __('Page type', 'sgpmPopupMaker'),
				'page_template' => __('Page template', 'sgpmPopupMaker')
			)
		);
		$targetOperators = array(
			array(
				'operator' => 'add',
				'name' => __('<i class="sgpm-margin-top-4 dashicons dashicons-plus"></i>', 'sgpmPopupMaker')
			),
			array(
				'operator' => 'delete',
				'name' => __('<i class="sgpm-margin-top-4 dashicons dashicons-minus"></i>', 'sgpmPopupMaker')
			)
		);
		$targetDataOperator = array(
			'==' => __('Is', 'sgpmPopupMaker'),
			'!=' => __('Is not', 'sgpmPopupMaker')
		);
		$targetInitialData = array(
			array(
				'param' => 'post_all',
				'operator' => '==',
				'value' => ''
			),
			array(
				'param' => 'page_all',
				'operator' => '==',
				'value' => ''
			)
		);

		$targetDataParams['param'] = apply_filters('sgpmPopupTargetParams', $targetParams);
		$targetDataParams['operator'] = apply_filters('sgpmPopupTargetOperator', $targetDataOperator);
		$targetDataParams['post_selected'] = apply_filters('sgpmPopupTargetPostData', array());
		$targetDataParams['page_selected'] = apply_filters('sgpmPopupTargetPageSelected', array());
		$targetDataParams['post_type'] = apply_filters('sgpmPopupTargetPostType', SGPMHelper::getAllCustomPostTypes());
		$targetDataParams['post_category'] = apply_filters('sgpmPopupTargetPostType', SGPMHelper::getPostsAllCategories());
		$targetDataParams['page_type'] = apply_filters('sgpmPopupTargetPostType', SGPMHelper::getPageTypes());
		$targetDataParams['page_template'] = apply_filters('sgpmPopupPageTemplates', array());
		$targetDataParams['post_all'] = null;
		$targetDataParams['page_all'] = null;

		$targetAttrs = array(
			'param' => array('class' => 'js-sgpm-select2 js-select-basic', 'data-select-type' => 'basic', 'autocomplete' => 'off'),
			'operator' => array('class' => 'js-sgpm-select2 js-select-basic', 'data-select-type' => 'basic'),
			'post_selected' => array('class' => 'js-sgpm-select2 js-select-ajax', 'isNotPostType' => false, 'data-select-type' => 'ajax', 'data-value-param' => 'post', 'multiple' => 'multiple'),
			'page_selected' => array('class' => 'js-sgpm-select2 js-select-ajax', 'data-select-type' => 'ajax', 'data-value-param' => 'page', 'multiple' => 'multiple'),
			'post_type' => array('class' => 'js-sgpm-select2 js-select-ajax', 'data-select-type' => 'multiple', 'data-value-param' => 'postTypes', 'isNotPostType' => true, 'multiple' => 'multiple'),
			'post_category' => array('class' => 'js-sgpm-select2 js-select-ajax', 'data-select-type' => 'multiple', 'data-value-param' => 'postCategories', 'isNotPostType' => true, 'multiple' => 'multiple'),
			'page_type' => array('class' => 'js-sgpm-select2 js-select-ajax', 'data-select-type' => 'multiple', 'data-value-param' => 'postCategories', 'isNotPostType' => true, 'multiple' => 'multiple'),
			'page_template' => array('class' => 'js-sgpm-select2 js-select-ajax', 'data-select-type' => 'multiple', 'data-value-param' => 'pageTemplate', 'isNotPostType' => true, 'multiple' => 'multiple')
		);

		$popupTarget['columnTypes'] = apply_filters('sgpmPopupTargetTypes', $targetElementTypes);
		$popupTarget['paramsData'] = apply_filters('sgpmPopupTargetData', $targetDataParams);
		$popupTarget['initialData'] = apply_filters('sgpmPopupTargetInitialData', $targetInitialData);
		$popupTarget['operators'] = apply_filters('sgpmPopupTargetOperators', $targetOperators);
		$popupTarget['attrs'] = apply_filters('sgpmPopupTargetAttrs', $targetAttrs);

		$SGPM_DATA_CONFIG_ARRAY['displayTarget'] = $popupTarget;
	}
}
