<template>
  <textarea
    @input="changeContent"
    @keyup.ctrl.enter="endEdit"
    @keyup.meta.enter="endEdit"
    @keyup.esc="cancelEdit">{{ content }}</textarea>
</template>

<script>

import autosize from 'autosize'

export default {
  name: 'autosize-textarea',
  props: ['content'],

  mounted() {
    autosize(this.$el)
  },

  methods: {
    changeContent() {
      this.$emit('input', this.$el.value);
    },

    cancelEdit() {
      this.$emit('cancel-edit')
    },

    endEdit(e) {
      this.$emit('end-edit')
    }
  }
}

</script>
