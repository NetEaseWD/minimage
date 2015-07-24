module.exports = {
	"output" : [
	{{#items}}
	{
		"name": "{{name}}",
		"left": {{offset_x}},
		"top": {{offset_y}},
		"width": {{width}},
		"height": {{height}}
	},
	{{/items}}
	]
}