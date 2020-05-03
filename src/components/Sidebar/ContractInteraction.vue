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
                    @