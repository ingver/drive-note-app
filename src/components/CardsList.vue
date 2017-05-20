<template>

<div class="cards-list">
  <div class="content-wrapper">
    <h2 class="list-title">
      {{ listData.title }}
    </h2>

    <div class="content-view-group"
        v-if="!editable">
      <div class="content-view"
        v-html="listContent">
      </div>
      <button class="button edit-button"
          @click="editContent">
        Edit
      </button>
    </div>

    <div class="content-edit-group"
       v-if="editable">
      <textarea class="content-edit"
        v-autofocus
        v-model="listData.content"
        @keyup.esc="endEdit">
      </textarea>
      <button class="button"
          @click="endEdit">
        Save
      </button>
    </div>
  </div>

  <div class="cards">
    <card v-for="item in listData.items" :key="item.id"
      :title="item.title"
      :content="item.content"
      :bg-img="item.bgImg">
    </card>
  </div>
</div>

</template>


<style scoped>

:root {
  --font: 'Roboto', Arial, sans-serif;
}

.cards-list {
  width: 100%;
  min-height: 100px;
  margin: 0 auto;
  padding: 15px;
  background-color: transparent;
  font-family: var(--font);

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

.list-title {
  display: block;
  margin: 10px;
  padding: 3px 2px;
  border-radius: 2px;
  line-height: 26px;
  font-size: 26px;
  font-family: Arial, sans-serif;
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
  font-family: inherit;
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
    border-radius: 2px;
    color: #666;
    word-wrap: break-word;

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
</style>


<script>

import marked from 'marked'
import Card from './Card.vue'

export default {
  name: 'cards-list',
  components: {
    Card
  },
  props: ['listData'],

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
      this.editable = true;
    },

    endEdit() {
      this.editable = false;
      this.listData.content = this.listData.content.trim();
    }
  },

  directives: {
    autofocus: {
      inserted(el) {
        el.focus();
      }
    }
  }
}

</script>
