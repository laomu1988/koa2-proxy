{%extends file="layout/layout.tpl"%}
{%*
@file   测试
@author muzhilong
*%}
{%block name="title"%}smarty-title{%/block%}

{%block name="header"%}
<div class="header">
	header
</div>
{%/block%}

{%block name="body"%}
<div class="body">{%$data.inline.sign%}</div>
{%/block%}

{%block name="loading"%}
<div class="loading">loading</div>
{%/block%}