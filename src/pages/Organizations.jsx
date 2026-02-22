import React, { useEffect, useRef, useState } from "react";
import {
  Typography,
  Box,
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
} from "@mui/material";
import { Add, Block, PlayArrow, Delete, VpnKey } from "@mui/icons-material";
import {
  CardComponent,
  ButtonComponent,
  DataTable,
  StatusChip,
  SearchBar,
  FormDialog,
} from "../components/common";
import api from "../services/apiService";
import toast from "react-hot-toast";

const defaultForm = {
  // 🏢 Organization Info
  gymName: "",
  contactEmail: "",
  contactPhone: "",
  address: {
    street: "",
    city: "",
    state: "",
    pincode: "",
  },
  notes: "",

  // 👤 Owner Info (Tenant User)
  owner: {
    name: "",
    email: "",
    password: "",
    phone: "",
  },

  // 💎 Subscription Info
  subscription: {
    planId: "",
    billingCycle: "monthly",
    expiryDate: "",
  },

  // 🏢 Main Branch (Mandatory)
  mainBranch: {
    name: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
    floorCount: 1,
    branchLogo: null,
  },

  // 🏢 Additional Branches
  branches: [],
};

const Organizations = () => {
  const [gyms, setGyms] = useState([]);
  const [total, setTotal] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(defaultForm);

  // File refs — stored separately from form state (not JSON-serializable)
  const mainBranchLogoRef = useRef(null);
  const branchLogosRef = useRef({}); // { [index]: File }

  const pagination = useRef({
    total: 0,
    page: 0,
    totalPages: 0,
  });

  // FIX: tracks page changes to trigger re-fetch
  const [page, setPage] = useState(0);

  const fetchGyms = async () => {
    try {
      const result = await api.get("/organizations", {
        params: {
          search,
          status: statusFilter,
          page: pagination?.current?.page + 1,
          limit: rowsPerPage,
        },
      });
      console.log(result, "result");
      if (result?.data?.success) {
        setGyms(result.data.result || []);
        setTotal(result?.data?.pagination?.total || 0);
        pagination.current = result?.data?.pagination;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data } = await api.get("/plans");
      setPlans(data.data.plans || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGyms();
  }, [search, statusFilter, page, rowsPerPage]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Build a clean payload without File objects
      const payload = JSON.parse(JSON.stringify(form));
      // Remove branchLogo from payload (sent as files)
      if (payload.mainBranch) delete payload.mainBranch.branchLogo;
      if (payload.branches) {
        payload.branches.forEach((b) => delete b.branchLogo);
      }

      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));

      // Append main branch logo
      if (mainBranchLogoRef.current) {
        formData.append("mainBranchLogo", mainBranchLogoRef.current);
      }

      // Append additional branch logos (in order)
      const branchFiles = branchLogosRef.current || {};
      Object.keys(branchFiles)
        .sort((a, b) => Number(a) - Number(b))
        .forEach((idx) => {
          if (branchFiles[idx]) {
            formData.append("branchLogos", branchFiles[idx]);
          }
        });

      await api.post("/organizations", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setOpenDialog(false);
      setForm(defaultForm);
      mainBranchLogoRef.current = null;
      branchLogosRef.current = {};
      fetchGyms();
    } catch (err) {
      console.error(err);
    }
  };

  const addBranch = () => {
    const currentPlan = plans?.find(
      (p) => p?._id === form?.subscription?.planId,
    );
    console.log(form, "form", plans);
    console.log(currentPlan, "currentPlan");
    if (!currentPlan) {
      toast.error("Please select a plan first");
      return;
    }
    const maxBranches = currentPlan?.branchLimit || 0;
    // Main branch occupies 1 slot, so additional branches max = limit - 1
    const maxAdditional = Math.max(0, maxBranches - 1);
    const currentBranches = (form?.branches || []).length;
    if (
      currentBranches >= maxAdditional &&
      currentPlan?.name !== "Enterprise"
    ) {
      toast.error(
        "You have reached the maximum number of branches allowed for this plan",
      );
      return;
    }
    setForm((pre) => ({
      ...pre,
      branches: [
        ...(pre?.branches?.length > 0 ? pre?.branches : []),
        {
          name: "",
          phone: "",
          address: { street: "", city: "", state: "", pincode: "" },
          floorCount: 1,
          branchLogo: null,
        },
      ],
    }));
  };

  const removeBranch = (index) => {
    setForm((pre) => {
      const updated = [...(pre.branches || [])];
      updated.splice(index, 1);
      return { ...pre, branches: updated };
    });
  };

  const handleAction = async (id, action) => {
    try {
      if (action === "suspend") await api.patch(`/organizations/${id}/suspend`);
      else if (action === "reactivate")
        await api.patch(`/organizations/${id}/reactivate`);
      else if (action === "delete") await api.delete(`/organizations/${id}`);
      else if (action === "reset")
        await api.post(`/organizations/${id}/reset-password`);
      fetchGyms();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { label: "Gym Name" },
    { label: "Owner" },
    { label: "Plan" },
    { label: "Status" },
    { label: "Sub Status" },
    { label: "Expiry" },
    { label: "Actions", align: "right" },
  ];

  // FIX: supports dot-notation names for nested fields e.g. "address.city", "owner.email", "subscription.planId"
  const handleChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split(".");

    if (keys.length === 1) {
      setForm((pre) => ({
        ...pre,
        [name]: value,
        ...(name === "subscription.planId" ? { branches: [] } : {}),
      }));
    } else if (keys.length === 2) {
      const [parent, child] = keys;
      if (name === "subscription.billingCycle") {
        const todayDate = new Date();
        let expiryDate = new Date(todayDate);

        if (value === "monthly") {
          expiryDate.setMonth(expiryDate.getMonth() + 1);
        } else if (value === "yearly") {
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        }

        setForm((pre) => ({
          ...pre,
          subscription: {
            ...pre.subscription,
            billingCycle: value,
            expiryDate: expiryDate.toISOString().split("T")[0], // yyyy-mm-dd
          },
        }));

        return; // 🔥 VERY IMPORTANT (stop further execution)
      }
      setForm((pre) => ({
        ...pre,
        [parent]: {
          ...pre[parent],
          [child]: value,
        },
        ...(name === "subscription.planId" ? { branches: [] } : {}),
      }));
    } else if (keys.length === 3) {
      // supports e.g. "branches.0.name" if needed in future
      const [parent, index, child] = keys;
      setForm((pre) => {
        const updated = [...(pre[parent] || [])];
        updated[index] = { ...updated[index], [child]: value };
        return { ...pre, [parent]: updated };
      });
    }
  };

  // FIX: branch-specific change handler using index and dot notation
  const handleBranchChange = (index, e) => {
    const { name, value } = e.target;
    const keys = name.split(".");

    setForm((pre) => {
      const updated = [...(pre.branches || [])];
      if (keys.length === 1) {
        updated[index] = { ...updated[index], [name]: value };
      } else if (keys.length === 2) {
        const [parent, child] = keys;
        updated[index] = {
          ...updated[index],
          [parent]: {
            ...(updated[index][parent] || {}),
            [child]: value,
          },
        };
      }
      return { ...pre, branches: updated };
    });
  };

  // Separate file handler for additional branch logos
  const handleBranchFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      branchLogosRef.current[index] = file;
    }
  };

  // Handler for main branch fields (supports dot notation for address)
  const handleMainBranchChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split(".");

    setForm((pre) => {
      if (keys.length === 1) {
        return {
          ...pre,
          mainBranch: { ...pre.mainBranch, [name]: value },
        };
      } else if (keys.length === 2) {
        const [parent, child] = keys;
        return {
          ...pre,
          mainBranch: {
            ...pre.mainBranch,
            [parent]: {
              ...(pre.mainBranch[parent] || {}),
              [child]: value,
            },
          },
        };
      }
      return pre;
    });
  };

  // Separate file handler for main branch logo
  const handleMainBranchFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      mainBranchLogoRef.current = file;
    }
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Gym Organizations
        </Typography>
        <ButtonComponent
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Create Gym
        </ButtonComponent>
      </Box>

      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search gyms..."
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <CardComponent noPadding>
        <DataTable
          columns={columns}
          rows={gyms}
          total={total}
          page={pagination?.current?.page}
          rowsPerPage={rowsPerPage}
          onPageChange={(newPage) => {
            pagination.current.page = newPage;
            // FIX: trigger re-fetch on page change
            setPage(newPage);
          }}
          onRowsPerPageChange={(val) => {
            setRowsPerPage(val);
            pagination.current.page = 0;
            setPage(0);
          }}
          emptyMessage="No organizations found"
          renderRow={(gym) => (
            <TableRow key={gym._id} hover>
              <TableCell>
                <Typography fontWeight={600}>{gym.name}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{gym.ownerName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {gym.ownerEmail}
                </Typography>
              </TableCell>
              <TableCell>{gym.subscription?.plan?.name || "—"}</TableCell>
              <TableCell>
                <StatusChip label={gym.status} />
              </TableCell>
              <TableCell>
                <StatusChip
                  label={gym.subscription?.status || "—"}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                {gym.subscription?.expiryDate
                  ? new Date(gym.subscription.expiryDate).toLocaleDateString()
                  : "—"}
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Suspend">
                  <IconButton
                    size="small"
                    onClick={() => handleAction(gym._id, "suspend")}
                    color="warning"
                  >
                    <Block />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reactivate">
                  <IconButton
                    size="small"
                    onClick={() => handleAction(gym._id, "reactivate")}
                    color="success"
                  >
                    <PlayArrow />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reset Password">
                  <IconButton
                    size="small"
                    onClick={() => handleAction(gym._id, "reset")}
                    color="info"
                  >
                    <VpnKey />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() => handleAction(gym._id, "delete")}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          )}
        />
      </CardComponent>

      <FormDialog
        open={openDialog}
        maxWidth="lg"
        onClose={() => setOpenDialog(false)}
        title="Create New Gym Organization"
        onSubmit={handleCreate}
        submitLabel="Create Gym"
      >
        {/* for main branch */}
        <TextField
          label="Gym Name"
          fullWidth
          margin="dense"
          value={form?.gymName}
          name="gymName"
          onChange={handleChange}
        />
        <TextField
          label="Contact Email"
          fullWidth
          margin="dense"
          value={form?.contactEmail}
          name="contactEmail"
          onChange={handleChange}
        />
        <TextField
          label="Contact Phone"
          fullWidth
          margin="dense"
          value={form?.contactPhone}
          name="contactPhone"
          onChange={handleChange}
        />
        <Typography sx={{ mt: 2, mb: 1 }} fontWeight="bold">
          Organization Address
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Street"
              fullWidth
              name="address.street"
              value={form?.address?.street}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="City"
              fullWidth
              name="address.city"
              value={form?.address?.city}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="State"
              fullWidth
              name="address.state"
              value={form?.address?.state}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Pincode"
              fullWidth
              name="address.pincode"
              value={form?.address?.pincode}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        {/* 🏢 Main Branch Section */}
        <Typography sx={{ mt: 3, mb: 1 }} variant="h6" fontWeight="bold">
          Main Branch (Mandatory)
        </Typography>
        <TextField
          label="Branch Name"
          fullWidth
          margin="dense"
          name="name"
          value={form?.mainBranch?.name}
          onChange={handleMainBranchChange}
          required
        />
        <TextField
          label="Branch Phone"
          fullWidth
          margin="dense"
          name="phone"
          value={form?.mainBranch?.phone}
          onChange={handleMainBranchChange}
        />
        <TextField
          label="Floor Count"
          fullWidth
          margin="dense"
          type="number"
          name="floorCount"
          value={form?.mainBranch?.floorCount}
          onChange={handleMainBranchChange}
          inputProps={{ min: 1 }}
        />
        <Typography sx={{ mt: 2, mb: 1 }}>Main Branch Address</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Street"
              fullWidth
              name="address.street"
              value={form?.mainBranch?.address?.street}
              onChange={handleMainBranchChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="City"
              fullWidth
              name="address.city"
              value={form?.mainBranch?.address?.city}
              onChange={handleMainBranchChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="State"
              fullWidth
              name="address.state"
              value={form?.mainBranch?.address?.state}
              onChange={handleMainBranchChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Pincode"
              fullWidth
              name="address.pincode"
              value={form?.mainBranch?.address?.pincode}
              onChange={handleMainBranchChange}
            />
          </Grid>
        </Grid>
        <Typography sx={{ mt: 2, mb: 1 }}>Branch Logo</Typography>
        <TextField
          fullWidth
          type="file"
          name="branchLogo"
          inputProps={{ accept: "image/*" }}
          onChange={handleMainBranchFileChange}
          InputLabelProps={{ shrink: true }}
        />

        <Typography sx={{ mt: 2, mb: 1 }} fontWeight="bold">
          Owner Details
        </Typography>
        <TextField
          label="Owner Name"
          fullWidth
          margin="dense"
          name="owner.name"
          value={form?.owner?.name}
          onChange={handleChange}
        />
        <TextField
          label="Owner Email"
          fullWidth
          margin="dense"
          type="email"
          name="owner.email"
          value={form?.owner?.email}
          onChange={handleChange}
        />
        <TextField
          label="Owner Password"
          fullWidth
          margin="dense"
          type="password"
          name="owner.password"
          value={form?.owner?.password}
          onChange={handleChange}
        />
        <TextField
          label="Owner Phone"
          fullWidth
          margin="dense"
          name="owner.phone"
          value={form?.owner?.phone}
          onChange={handleChange}
        />
        {/* FIX: was reading form.planId but state is under form.subscription.planId */}
        <FormControl fullWidth margin="dense">
          <InputLabel>Plan</InputLabel>
          <Select
            value={form.subscription.planId}
            label="Plan"
            name="subscription.planId"
            onChange={handleChange}
          >
            {plans?.map((p) => (
              <MenuItem key={p?._id} value={p?._id}>
                {p?.name} – ₹{p?.priceMonthly}/mo
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* FIX: was reading form.billingCycle but state is under form.subscription.billingCycle */}
        <FormControl fullWidth margin="dense">
          <InputLabel>Billing Cycle</InputLabel>
          <Select
            value={form?.subscription?.billingCycle}
            label="Billing Cycle"
            name="subscription.billingCycle"
            onChange={handleChange}
          >
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </Select>
        </FormControl>
        {/* FIX: was reading form.expiryDate but state is under form.subscription.expiryDate */}
        <TextField
          label="Expiry Date"
          fullWidth
          margin="dense"
          type="date"
          value={form?.subscription?.expiryDate}
          name="subscription.expiryDate"
          onChange={handleChange}
          InputProps={{
            readOnly: true,
          }}
          InputLabelProps={{ shrink: true }}
          helperText="Leave empty to auto-calculate from billing cycle"
        />
        {/*Branches */}
        <Box
          sx={{
            mt: 3,
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Additional Branches
          </Typography>
          <ButtonComponent onClick={addBranch} startIcon={<Add />}>
            Add Branch
          </ButtonComponent>
        </Box>
        {/* FIX: use index as key, and use handleBranchChange with index for correct per-branch state updates */}
        {form?.branches?.map((b, index) => {
          return (
            <Box
              key={index}
              sx={{ border: "1px solid #ddd", p: 2, borderRadius: 2, mb: 2 }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography fontWeight="bold">Branch {index + 1}</Typography>
                <IconButton color="error" onClick={() => removeBranch(index)}>
                  <Delete />
                </IconButton>
              </Box>
              <TextField
                label="Branch Name"
                fullWidth
                margin="dense"
                name="name"
                value={b?.name}
                onChange={(e) => handleBranchChange(index, e)}
              />
              <TextField
                label="Branch Phone"
                fullWidth
                margin="dense"
                name="phone"
                value={b?.phone}
                onChange={(e) => handleBranchChange(index, e)}
              />
              <TextField
                label="Branch Floor Count"
                fullWidth
                margin="dense"
                type="number"
                name="floorCount"
                value={b?.floorCount}
                onChange={(e) => handleBranchChange(index, e)}
              />

              <Typography sx={{ mt: 2, mb: 1 }}>Branch Address</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Street"
                    fullWidth
                    name="address.street"
                    value={b?.address?.street}
                    onChange={(e) => handleBranchChange(index, e)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="City"
                    fullWidth
                    name="address.city"
                    value={b?.address?.city}
                    onChange={(e) => handleBranchChange(index, e)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="State"
                    fullWidth
                    name="address.state"
                    value={b?.address?.state}
                    onChange={(e) => handleBranchChange(index, e)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Pincode"
                    fullWidth
                    name="address.pincode"
                    value={b?.address?.pincode}
                    onChange={(e) => handleBranchChange(index, e)}
                  />
                </Grid>
              </Grid>

              <Typography sx={{ mt: 2, mb: 1 }}>Branch Logo</Typography>
              <TextField
                fullWidth
                type="file"
                name="branchLogo"
                inputProps={{ accept: "image/*" }}
                onChange={(e) => handleBranchFileChange(index, e)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          );
        })}
      </FormDialog>
    </Box>
  );
};

export default Organizations;
