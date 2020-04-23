<template>
  <codemirror ref="myCm" :value="code" :options="editorOptions" :style="{ height: height >0 && height + 'px' }" class="codemirror" @input="onCmCodeChange" @gutterClick="onGutterClick" />
</template>

<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action, Mutation, Getter, State } from 'vuex-class'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'
import 'codemirror/mode/javascript/javascript.js'
import { EditorOptions } from '../../store/types'

const namespace = 'workspace'

@Component({
    components: {
        codemirror
    }
})
export default class Tab extends Vue {
  @Pr