<?php
	$this->load->model('user/user_group');
	$this->model_user_user_group->addPermission($this->user->getGroupId(), 'access', 'sale/tw_live');
	$this->model_user_user_group->addPermission($this->user->getGroupId(), 'modify', 'sale/tw_live');