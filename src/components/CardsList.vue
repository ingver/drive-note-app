<template>

<div class="list">
  <h2 class="list-title">
    List Title
  </h2>
  <div class="description">
    The <em>description</em> of a <strong>List</strong> will be here
  </div>
  <div class="cards">
    <card
      title="Alpinism"
      description="Short description of a card"
      bg-img="https://images.unsplash.com/photo-1473874629247-1bc73eda6f98?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=500&h=300&fit=crop&s=0765dd6291bdca493cb34ebb22338707">
    </card>
    <card
      title="Recipes"
      description="Short description of a card"
      bg-img="https://images.unsplash.com/photo-1475474369946-72bb667aae19?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=500&h=300&fit=crop&s=1101d276fa2a1e5db7742f591d0fdcc2">
    </card>
    <card
      title="Architecture"
      description="Short description of a card"
      bg-img="https://images.unsplash.com/photo-1432836689000-d6a3632db7ab?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=500&h=300&fit=crop&s=5df91ad84730a5e71a4f329ef6e541f1">
    </card>
    <card
      title="Pictures"
      description="Short description of a card"
      bg-img="https://media.giphy.com/media/xUA7bhI09WU14GI6kg/giphy.gif">
    </card>
    <card
      title="Ducks"
      description="Short description of a card"
      bg-img="http://www.bestprintingonline.com/help_resources/Image/Ducky_Head_Web_Low-Res.jpg">
    </card>
  </div>
</div>

</template>


<style scoped>

.list {
  width: 100%;
  min-height: 100px;
  margin: 0 auto;
  padding: 15px;
  background-color: #f0f0f0;
  font-family: Arial, sans-serif;

  @media (max-width: 900px) {
    padding: 10px;
  }

  @media (max-width: 700px) {
    padding: 5px;
  }
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

.description {
  margin: 10px;
  padding: 5px;
  color: #666;
  word-wrap: break-word;

  @media (max-width: 700px) {
    margin: 5px;
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

import Card from './Card.vue'

export default {
  name: 'cards-list',
  components: {
    Card
  },
  data() {
    return {}
  }
}

</script>
