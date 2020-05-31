
<template>
  <div>
    <NodeAddressInput id="run" />

    <el-row :gutter="11">
      <el-col
        :span="7"
        :offset="1"
      >
        <p>Account</p>
      </el-col>
      <el-col :span="11">
        <el-select
          id="accountSelect"
          v-model="selectedAccountModel"
          :loading="accountsLoading"
          class="select"
          placeholder="Choose an Account"
          style="display: block"
        >
          <el-option
            v-for="account in accounts"
            :key="account.value"
            :label="account.label"
            :value="account.value"
            class="accountSelectOption"
          />
        </el-select>
      </el-col>
      <el-col :span="2">
        <el-button
          id="refreshAccounts"
          :loading="accountsLoading"
          type="primary"
          size="mini"
          icon="el-icon-refresh"
          circle
          style="margin-top:0.69rem"
          @click="getAccounts"
        />
      </el-col>
      <el-col :span="2">
        <el-button
          id="copyAccount"
          type="primary"
          class="secondaryButton"
          size="mini"
          icon="el-icon-tickets"
          circle
          style="margin-top:0.69rem"
          @click="$copyText(selectedAccount);$notify({
            title: 'Success',
            message: 'Copied Address to clipboard',
            type: 'success',
            duration: 1500
          })"
        />
      </el-col>
    </el-row>

    <el-row>
      <el-col
        :span="7"
        :offset="1"
      >
        <p>Gas Limit</p>
      </el-col>
      <el-col :span="13">
        <el-input
          id="gasLimitInput"
          v-model="gasLimitModel"
          :value="gasLimit"
          type="number"
          clearable
        />
      </el-col>
    </el-row>

    <el-row>
      <el-col
        :span="7"
        :offset="1"
      >
        <p>Gas Price</p>
      </el-col>
      <el-col :span="13">
        <el-input
          id="gasPriceInput"
          v-model="gasPriceModel"
          :value="gasPrice"
          type="number"
          clearable
        />
      </el-col>
    </el-row>

    <el-row :gutter="11">
      <el-col
        :span="7"
        :offset="1"
      >
        <p>Value</p>
      </el-col>
      <el-col :span="7">
        <el-input
          id="valueInput"
          v-model="amountModel"
          :value="value.amount"
          type="number"
          clearable
        />
      </el-col>
      <el-col :span="6">
        <el-select
          id="valueSelect"
          v-model="unitModel"
          class="select"
          placeholder="Unit"
          style="display: block"
        >
          <el-option
            v-for="unit in getUnits"
            :key="unit.value"
            :label="unit.label"
            :value="unit.value"
            class="selectUnitOption"
          />
        </el-select>
      </el-col>
    </el-row>

    <el-row :gutter="11">
      <el-col
        :span="20"
        :offset="1"
      >
        <ContractNameSelect id="run" />
      </el-col>
      <el-col :span="3">
        <el-button
          id="contractRefresh"
          :loading="compileLoading"
          type="primary"
          size="mini"
          icon="el-icon-refresh"
          circle
          style="margin-top:0.69rem"
          @click="handleCompile"
        />
      </el-col>
    </el-row>

    <el-row>
      <el-col
        v-if="constructorArgs"
        :offset="1"
        :span="deployLoading ? 12: 13"
      >
        <el-popover
          :content="constructorArgs"
          :open-delay="200"
          placement="bottom-start"
          width="50%"
          trigger="focus"
        >
          <el-input
            id="deployArgsInput"
            slot="reference"
            v-model="contractArgsModel"
            :placeholder="constructorArgs"
            clearable
          />
        </el-popover>
      </el-col>
    </el-row>

    <el-row>
      <el-col
        :offset="1"
        :span="deployLoading ? 8: 7"
      >
        <el-button
          id="deploy"
          :loading="deployLoading"
          style="width:100%"
          type="primary"
          class="textColorBlack"
          @click="handleDeploy"
        >
          Deploy
        </el-button>
      </el-col>
      <el-col
        v-if="constructorArgs"
        :offset="1"
        :span="deployLoading === true ? 12: 13"
      >
        <el-button
          id="cancelDeploy"
          type="danger"
          size="mini"
          icon="el-icon-close"
          circle
          style="margin-top:0.69rem"
          @click="stopDeploying"
        />
      </el-col>
    </el-row>

    <el-row style="margin-top:-20px;margin-bottom:0px">
      <el-col :offset="3">
        <p>or</p>
      </el-col>
    </el-row>

    <el-row type="flex">
      <el-col
        :offset="1"
        :span="retrieveContractFromAddressLoading ? 8: 7"
      >
        <el-button
          id="atAddress"
          :loading="retrieveContractFromAddressLoading"
          style="width:100%"
          class="secondaryButton"
          type="primary"
          @click="handleRetrieveContractFromAddress"
        >
          At Address
        </el-button>
      </el-col>
      <el-col :span="retrieveContractFromAddressLoading ? 12: 13">
        <el-input
          id="contractAddressInput"
          v-model="fromAddressModel"
          placeholder="Load contract from Address"
          clearable
        />
      </el-col>
    </el-row>
    <ContractInteraction />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action, Mutation, Getter, State } from 'vuex-class'
import { Notification } from 'element-ui'
import { Account, Value } from '../../store/types'
import { ParsedContractConstructor } from '../../store/modules/sidebar/compile'
import { SaveValue } from '../../store/modules/sidebar/run'
import NodeAddressInput from './NodeAddressInput.vue'
import ContractNameSelect from './ContractNameSelect.vue'
import ContractInteraction from './ContractInteraction.vue'
const namespace = 'run'
@Component({
  components: {
    NodeAddressInput,
    ContractNameSelect,
    ContractInteraction,
  },
})
export default class Run extends Vue {
  @State('providerInstance', { namespace }) public providerInstance!: any
  @State('accountsLoading', { namespace }) public accountsLoading!: boolean
  @State('selectedAccount', { namespace }) public selectedAccount!: string
  @State('gasLimit', { namespace }) public gasLimit!: number
  @State('gasPrice', { namespace }) public gasPrice!: number
  @State('value', { namespace }) public value!: Value
  @State('contractArgs', { namespace }) public contractArgs!: string
  @Getter('getUnits', { namespace }) public getUnits!: object[]
  @Getter('contractNames', { namespace: 'compile' }) public contractNames!: string[]
  @Getter('parsedContractConstructor', { namespace: 'compile' }) public parsedContractConstructor!: ParsedContractConstructor
  @Getter('accounts', { namespace }) public accounts!: Account[]
  @Getter('getLatestContractAddress', { namespace }) public getLatestContractAddress!: string
  @Mutation('saveValue', { namespace }) public saveValue!: (value: SaveValue) => void
  @Mutation('saveGasLimit', { namespace }) public saveGasLimit!: (gasLimit: number) => void
  @Mutation('saveGasPrice', { namespace }) public saveGasPrice!: (gasPrice: number) => void
  @Mutation('saveSelectAccount', { namespace }) public saveSelectAccount!: (account: string) => void
  @Mutation('setContractArgs', { namespace }) public setContractArgs!: (contractArgs: string) => void
  @Action('fetchAccounts', { namespace }) public fetchAccounts!: () => void
  @Action('compile', { namespace: 'compile' }) public compile!: () => void
  @Action('deploy', { namespace }) public deploy!: () => void
  @Action('retrieveContractFromAddress', { namespace }) public retrieveContractFromAddress!: (address: string) => void

  public fromAddressModel: string = ''