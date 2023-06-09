
<template>
  <div>
    <NodeAddressInput v-show="!useInBrowserCompiler" id="compile"/>
    <el-row v-show="useInBrowserCompiler" :gutter="11">
      <el-col :span="7" :offset="1">
        <p>Compiler Version</p>
      </el-col>
      <el-col :span="13">
        <el-select
          id="compilerVersionSelect"
          v-model="selectedSolVersionModal"
          class="select"
          style="display: block"
          placeholder="Select new compiler version"
          autocomplete
        >
          <el-option
            v-for="version in solVersions"
            :key="version"
            :label="version"
            :value="version"
            class="solVersionOptions
            "
          />
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-button
          id="solVersionsRefresh"
          type="primary"
          size="mini"
          icon="el-icon-refresh"
          circle
          style="margin-top:0.69rem"
          @click="loadSolVersions"
        />
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24" :offset="8">
        <el-checkbox v-model="useInBrowserCompilerModal">Use In browser compiler</el-checkbox>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24" :offset="10">
        <el-button
          id="startCompile"
          :loading="loading"
          type="primary"
          class="textColorBlack"
          @click="handleCompile"
        >Start to Compile</el-button>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="18" :offset="3">
        <ContractNameSelect id="compile"/>
      </el-col>
    </el-row>

    <el-row>
      <el-col v-show="selectedContract !== ''" :offset="13">
        <el-button
          id="showContractDetails"
          type="primary"
          class="textColorBlack"
          @click="dialogAbiDetailsVisible = true"
        >Details</el-button>
        <el-button
          type="primary"
          class="secondaryButton"
          icon="el-icon-tickets"
          circle
          style="padding: 5px;margin-top: .65rem;"
          @click="copyToClipboard"
        />
      </el-col>
    </el-row>

    <el-row>
      <el-col id="lint" :span="23" :offset="1" style="padding-right:1rem">
        <h3>Problems ({{ lintDetails.length }})</h3>
        <el-collapse v-model="activeName" accordion>
          <el-collapse-item
            v-for="(report, index) in lintDetails"
            :key="index"
            :title="`line ${report.line} column ${report.column} - ${report.ruleId}`"
            :name="index"
            class="lint-report"
            style="overflow:hidden"
          >
            <el-row style="margin-top:1rem">
              <el-col :span="23" :offset="1">
                <i v-if="report.severity === 2" class="el-icon-warning warning"/>
                <i v-if="report.severity === 3" class="el-icon-warning danger"/>
              </el-col>
              <el-col :span="23" :offset="1">
                <p>{{ report.message }}</p>
              </el-col>
            </el-row>
          </el-collapse-item>
        </el-collapse>
      </el-col>
    </el-row>

    <el-dialog :title="selectedContract" :visible.sync="dialogAbiDetailsVisible" width="80%">
      <tree-view id="treeView" :data="contractDetails()" :options="{maxDepth: 3}"/>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Mutation, Getter, State } from 'vuex-class'
import { Notification } from 'element-ui'
import ContractNameSelect from './ContractNameSelect.vue'
import NodeAddressInput from './NodeAddressInput.vue'
import { File } from '../../store/types'
import linter from 'solhint/lib/index'

const namespace = 'compile'

@Component({
  components: {
    ContractNameSelect,
    NodeAddressInput,
  },
})
export default class Compile extends Vue {
  @State('selectedContract', { namespace }) public selectedContract!: string
  @State('solVersions', { namespace }) public solVersions!: string[]
  @State('selectedSolVersion', { namespace }) public selectedSolVersion!: string
  @State('useInBrowserCompiler', { namespace }) public useInBrowserCompiler!: boolean

  @Getter('activeFile', { namespace: 'workspace' }) public activeFile!: File
  @Getter('contractDetails', { namespace }) public contractDetails!: (contractName?: string) => any

  @Mutation('setSolVersion', { namespace }) public setSolVersion!: (version: string) => void
  @Mutation('toggleInBrowserCompiler', { namespace }) public toggleInBrowserCompiler!: () => void

  @Action('compile', { namespace }) public compile!: () => void
  @Action('loadSolVersions', { namespace }) public loadSolVersions!: () => void
  @Action('fetchAccounts', { namespace: 'run' }) public fetchAccounts!: () => void

  public dialogAbiDetailsVisible: boolean = false
  public loading: boolean = false
  public activeName: string = '1'
  public $copyText: any
  public async handleCompile(): Promise<void> {
    this.loading = true
    try {
      await this.compile()
    } catch (e) {
      await Notification.error({
        title: 'Error',
        message: `${e.message}${JSON.stringify(e)}`,
        duration: 10000,
      })
      console.error(e)
    } finally {
      this.loading = false
    }
  }
  public set useInBrowserCompilerModal(val: boolean) {
    this.toggleInBrowserCompiler()
  }
  public get useInBrowserCompilerModal(): boolean {
    return this.useInBrowserCompiler
  }

  public set selectedSolVersionModal(solVersion: string) {
    this.setSolVersion(solVersion)
  }
  public get selectedSolVersionModal(): string {
    return this.selectedSolVersion
  }
  public get lintDetails(): string {
    const configAsJson = {
      extends: 'default',
      rules: {
        'avoid-throw': false,
        'compiler-fixed': true,
        'avoid-suicide': 'error',
        'avoid-sha3': 'warn',
        indent: true,
        'payable-fallback': false,
      },
    }
    const code = this.activeFile.code
    const { reports } = linter.processStr(code, configAsJson)
    return reports
  }
  public async copyToClipboard() {
    try {
      await this.$copyText(JSON.stringify(this.contractDetails()))
      await Notification.success({
        title: 'Success',
        message: 'Copied to Clipboard',
        duration: 500,
      })
    } catch (e) {
      await Notification.error({
        title: 'Error',
        message: 'Unable to Copy',
        duration: 10000,
      })
      console.error(e)
    }
  }
}
</script>

<style lang="stylus">
.el-row {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.danger {
  color: #fff;
  background-color: #f56c6c;
  border-color: #f56c6c;
  border-radius: 50%;
  padding: 6px;
}

.warning {
  color: #fff;
  background-color: #e6a23c;
  border-color: #e6a23c;
  border-radius: 50%;
  padding: 6px;
}
</style>
