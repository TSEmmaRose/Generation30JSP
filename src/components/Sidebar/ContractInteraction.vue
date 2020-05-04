<template>
  <div style="margin-top: 20px;padding: 15px;">
    <el-collapse>
      <el-collapse-item
        v-for="(contract, index) in parsedContracts"
        :key="index"
        :title="contract.title"
        :name="'deployedContract' + index"
        :id="'deployedContract' + index"
      >
        <el-table :data="contract.abi" :show-header="false" style="width: 100%">
          <el-table-column>
            <template slot-scope="scope">
              <!-- {{ JSON.stringify(scope.row) }} -->
              <el-row type="flex">
                <el-col :offset="1" :span="scope.row.loading ? 8 : 7">
                  <el-button
                    :id="'deployedContract' + index + scope.row.name"
                    :loading="scope.row.loading"
                    style="width:100%"
                    class="secondaryButton"
                    type="primary"
                    @click="
                      scope.row.loading = true
                      handleFunctionCall(
                        scope.row,
                        contract.contractInstance,
                        contract.contractAddress
                      ).then((res) => {
                        scope.row.res = res
                        scope.row.loading = false
                      })
                    "
                  >{{ scope.row.name }}</el-button>
                </el-col>
                <el-col v-if="scope.row.inputs.length > 0" :span="scope.row.loading ? 12 : 13">
                  <el-popover
                    :content="scope.row.combinedInputs"
                    :open-delay="200"
                    placement="bottom-start"
                    width="50%"
                    trigger="focus"
                  >
                    <el-input
                      slot="reference"
                      :id="
                        'deployedContract' + index + scope.row.name + 'input'
                      "
                      v-model="scope.row.argsModel"
                      :placeholder="scope.row.combinedInputs"
                      clearable
                    />
                  </el-popover>
                </el-col>
              </el-row>
              <el-row>
                <p
                  v-for="(output, index) in scope.row.outputs"
                  v-show="scope.row.res"
                  :key="index"
                  type="flex"
                >
                  {{ index }} : {{ output.type }}:
                  {{ scope.row.res && scope.row.res[index] }}
            