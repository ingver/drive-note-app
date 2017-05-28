<template>

<div class="list-view">
  <div v-if="!signedIn" class="sign-in-banner banner">
    <p class="notification">You must be signed into your Google Account to use the app!</p>
  </div>

  <div v-else-if="loading" class="loading-banner banner">
    <p class="notification">Loading...</p>
  </div>

  <div v-else-if="!atRoot" class="content-wrapper">
    <h2 class="title">
      {{ listData.title }}
    </h2>
    <div class="content-view-group"
        v-if="!editable">

      <div class="content-view"
        v-if="listData.content === ''">
        <p class="empty-content">No content here yet (click EDIT to add some)</p>
      </div>
      <div class="content-view"
        v-else v-html="listContent">
      </div>

      <button class="button edit-button"
          @click="editContent">
        Edit
      </button>
    </div>
  </div>

  <div class="content-edit-group"
     v-if="editable">
    <autosize-textarea class="content-edit"
      v-autofocus
      :content="listData.content"
      @input="handleEdit"
      @keyup.esc="endEdit">
    </autosize-textarea>
    <button class="button"
        @click="endEdit">
      Save
    </button>
  </div>

  <div v-if="!loading && listData !== null" class="cards">
    <card v-for="item in listData.items" :key="item.id"
      :id="item.id"
      :title="item.title"
      :content="item.content"
      :bg-img="item.bgImg">
    </card>
  </div>

</div>

</template>


<style scoped>

:root {
  --text-font: 'Source Sans Pro', Arial, sans-serif;
  --button-font: 'Roboto', Arial, sans-serif;
}

.list-view {
  width: 100%;
  min-height: 100px;
  margin: 0 auto;
  padding: 30px;
  background-color: transparent;
  font-family: var(--text-font);

  @media (max-width: 900px) {
    padding: 10px;
  }

  @media (max-width: 700px) {
    padding: 5px;
  }
}

.content-wrapper {
  position: relative;
}

.title {
  display: block;
  margin: 10px;
  padding: 3px 2px;
  border-radius: 2px;
  line-height: 26px;
  font-size: 26px;
  font-family: var(--text-font);
  font-weight: bold;
  color: #666;
  word-wrap: break-word;

  @media (max-width: 700px) {
    margin: 5px;
  }

  &:hover {
    color: #444;
    background-color: rgba(0,0,0,0.02);
  }

  &::selection,
  & *::selection {
    background: rgba(0,0,0,0.3);
    color: #fff;
  }
}

.button {
  background-color: transparent;
  margin: 10px;
  padding: 5px;
  border: 1px solid rgba(0,0,0,0.3);
  border-radius: 3px;
  font-family: var(--button-font);
  text-transform: uppercase;
  outline: none;

  @media (max-width: 700px) {
    margin: 5px;
  }
}

.content-view-group {
  position: relative;
  margin: 10px;

  @media (max-width: 700px) {
    margin: 5px;
  }

  & .content-view {
    padding: 3px;
    min-height: 50px;
    border-radius: 2px;
    color: #666;
    word-wrap: break-word;

    & .empty-content {
      font-style: italic;
      font-size: 16px;
      color: #888;
    }

    &:hover {
      color: #444;
      background: rgba(0,0,0,0.02);
    }

    &::selection,
    & *::selection {
      background: rgba(0,0,0,0.3);
      color: #fff;
    }
  }

  & .edit-button {
    @media (min-width: 700px) {
      position: absolute;
      top: 0px;
      right: 0px;
    }
  }
}

.content-edit-group {
  margin: 10px;

  @media (max-width: 700px) {
    margin: 5px;
  }

  & .content-edit {
    width: 100%;
    min-height: 100px;
    padding: 10px;
    border-radius: 2px;
    background-color: transparent;
    border: 1px solid rgba(0,0,0,0.3);
    box-shadow: inset 0px 0px 2px 1px rgba(0,0,0,0.3);
    outline: none;
    resize: none;

    @media (max-width: 700px) {
      min-height: 70px;
      padding: 5px;
    }
  }
}

.cards {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: flex-start;

  @media (max-width: 700px) {
    align-items: stretch;
    flex-direction: column;
  }
}

.banner {
  display: flex;
  justify-content: center;
}

.notification {
  text-align: center;
  font-size: 32px;
  color: rgba(0,0,0,0.25);

  @media (max-width: 700px) {
    font-size: 24px;
  }
}
</style>


<script>

import marked from 'marked'
import autosize from 'autosize'
import Card from './Card.vue'
import AutosizeTextarea from './AutosizeTextarea.vue'

export default {
  name: 'list-view',
  components: {
    Card,
    AutosizeTextarea
  },
  props: {
    listData: Object,
    signedIn: Boolean,
    atRoot: Boolean,
    loading: Boolean
  },

  data() {
    return {
      editable: false
    }
  },

  computed: {
    listContent() {
      return marked(this.listData.content)
    }
  },

  methods: {
    editContent() {
      this.editable = true
    },

    handleEdit(newContent) {
      this.listData.content = newContent
    },

    endEdit() {
      this.editable = false
      this.listData.content = this.listData.content.trim()
      this.$emit('update-content')
    }
  },

  directives: {
    autofocus: {
      inserted(el) {
        el.focus()
      }
    }
  }
}

</script>
